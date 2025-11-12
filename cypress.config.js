const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');

// Define global environment URLs
const environments = {
  staging: 'https://app.staging.bike4mind.com/',
  production: 'https://app.bike4mind.com/'
};

module.exports = defineConfig({
  retries: 1,
  e2e: {
    specPattern: [
      'cypress/e2e/Auth.cy.js',
      'cypress/e2e/Signup.cy.js',
      'cypress/e2e/Projects.cy.js',
      'cypress/e2e/Notebook.cy.js',
      'cypress/e2e/Prompts.cy.js',
      'cypress/e2e/Admin.cy.js',
      'cypress/e2e/Profile.cy.js'
    ],
    supportFile: 'cypress/support/index.js',
    env: {
      //set appURL to production or staging
      appUrl: process.env.CYPRESS_APP_URL || environments.staging
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on, config) {
      on('after:run', (results) => {
        if (results) {
          // Extract detailed failure information
          const failures = [];
          results.runs.forEach(run => {
            if (run.tests) {
              run.tests.forEach(test => {
                if (test.state === 'failed') {
                  const attempts = test.attempts || [];
                  const lastAttempt = attempts[attempts.length - 1];
                  if (lastAttempt && lastAttempt.error) {
                    failures.push({
                      specName: run.spec.name,
                      suite: test.title.join(' > ').split(' > ').slice(0, -1).join(' > '),
                      testName: test.title[test.title.length - 1],
                      fullTitle: test.title.join(' > '),
                      error: lastAttempt.error.message,
                      stack: lastAttempt.error.stack,
                      attempt: attempts.length
                    });
                  }
                }
              });
            }
          });

          // Create a comprehensive test summary
          const summary = {
            totalTests: results.totalTests || 0,
            totalPassed: results.totalPassed || 0,
            totalFailed: results.totalFailed || 0,
            totalPending: results.totalPending || 0,
            totalSkipped: results.totalSkipped || 0,
            browserName: results.browserName,
            browserVersion: results.browserVersion,
            osName: results.osName,
            osVersion: results.osVersion,
            startedAt: results.startedAt,
            endedAt: results.endedAt,
            specs: results.runs.map(run => ({
              specName: run.spec.name,
              tests: run.stats.tests,
              passes: run.stats.passes,
              failures: run.stats.failures,
              pending: run.stats.pending,
              skipped: run.stats.skipped
            })),
            failures: failures
          };

          // Ensure directory exists
          const resultsDir = 'cypress/reports';
          if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
          }

          // Write summary to file
          fs.writeFileSync(
            path.join(resultsDir, 'results.json'),
            JSON.stringify(summary, null, 2)
          );

          // Log summary to console for debugging
          console.log('\n' + '='.repeat(60));
          console.log('  TEST RESULTS SUMMARY');
          console.log('='.repeat(60));
          console.log(`  Total:   ${summary.totalTests}`);
          console.log(`  Passed:  ${summary.totalPassed} ✅`);
          console.log(`  Failed:  ${summary.totalFailed} ${summary.totalFailed > 0 ? '❌' : ''}`);
          console.log(`  Pending: ${summary.totalPending}`);
          console.log(`  Skipped: ${summary.totalSkipped}`);
          
          if (failures.length > 0) {
            console.log('\n' + '-'.repeat(60));
            console.log('  FAILED TESTS:');
            console.log('-'.repeat(60));
            failures.forEach((failure, index) => {
              console.log(`\n  ${index + 1}. ${failure.fullTitle}`);
              console.log(`     Error: ${failure.error.split('\n')[0]}`);
            });
          }
          console.log('\n' + '='.repeat(60) + '\n');
        }
      });

      on('task', {
        writeFile({ filePath, content }) {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
          return null;
        },
        initializeTestQualityLog({ filePath }) {
          // Only initialize if file doesn't exist or is from a previous run (>5 minutes old)
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          let shouldInitialize = false;
          
          if (fs.existsSync(filePath)) {
            // Check if file is from a previous run (older than 5 minutes)
            const stats = fs.statSync(filePath);
            const ageMinutes = (Date.now() - stats.mtimeMs) / 1000 / 60;
            shouldInitialize = ageMinutes > 90;
            
            if (shouldInitialize) {
              console.log('[Test Quality] Resetting stale test quality file (age: ' + ageMinutes.toFixed(1) + ' minutes)');
            } else {
              console.log('[Test Quality] Preserving existing test quality file from current run');
            }
          } else {
            shouldInitialize = true;
            console.log('[Test Quality] Creating new test quality file');
          }
          
          if (shouldInitialize) {
            const initialData = {
              issues: [],
              totalIssues: 0,
              summary: {
                likelyBug: 0,
                selectorIssues: 0
              }
            };
            fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
          }
          
          return null;
        },
        updateErrorLog({ filePath, newErrors }) {
          let existingData = { errors: [], totalErrors: 0 };
          if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath));
          }

          // Deduplicate existing errors
          const existingSet = new Set(
            existingData.errors.map(err => JSON.stringify({
              message: err.message,
              suite: err.suite,
              test: err.test
            }))
          );

          // Add new unique errors
          const allErrors = [...existingData.errors];
          for (const error of newErrors) {
            const errorKey = JSON.stringify({
              message: error.message,
              suite: error.suite,
              test: error.test
            });

            if (!existingSet.has(errorKey)) {
              allErrors.push(error);
              existingSet.add(errorKey);
            }
          }

          // Write deduplicated errors
          const updatedData = {
            lastUpdate: new Date().toISOString(),
            totalErrors: allErrors.length,
            errors: allErrors
          };

          fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
          return null;
        },
        updateTestQualityLog({ filePath, newIssues }) {
          let existingData = {
            issues: [],
            totalIssues: 0,
            summary: {
              likelyBug: 0,
              selectorIssues: 0
            }
          };
          
          if (fs.existsSync(filePath)) {
            try {
              const fileContent = fs.readFileSync(filePath, 'utf8');
              existingData = JSON.parse(fileContent);
            } catch (error) {
              console.error('[Test Quality] Error reading file, resetting:', error.message);
              // If file is corrupted, reset to default structure
            }
          }

          // Deduplicate issues based on type, suite, test, AND timestamp
          // This allows tracking multiple instances across different test runs
          const existingMap = new Map();
          
          // Preserve existing issues
          if (existingData.issues && Array.isArray(existingData.issues)) {
            existingData.issues.forEach(issue => {
              const key = `${issue.type}|${issue.category}|${issue.suite}|${issue.test}|${issue.timestamp}`;
              existingMap.set(key, issue);
            });
          }

          // Add new issues (each with unique timestamp is kept)
          for (const issue of newIssues) {
            const key = `${issue.type}|${issue.category}|${issue.suite}|${issue.test}|${issue.timestamp}`;
            if (!existingMap.has(key)) {
              existingMap.set(key, issue);
            }
          }

          const allIssues = Array.from(existingMap.values());

          // Calculate summary statistics by category
          const summary = {
            likelyBug: allIssues.filter(i => i && i.category === 'Likely Bug').length,
            selectorIssues: allIssues.filter(i => i && i.category === 'Selector Issue').length
          };

          // Write deduplicated issues with validation
          const updatedData = {
            lastUpdate: new Date().toISOString(),
            totalIssues: allIssues.length,
            summary,
            issues: allIssues
          };

          try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            
            // Write with validation
            const jsonString = JSON.stringify(updatedData, null, 2);
            
            // Validate JSON is parseable before writing
            JSON.parse(jsonString);
            
            // Write atomically (write to temp file then rename)
            const tempFile = filePath + '.tmp';
            fs.writeFileSync(tempFile, jsonString, 'utf8');
            fs.renameSync(tempFile, filePath);
            
            console.log(`[Test Quality] Successfully logged ${newIssues.length} new issue(s), total: ${allIssues.length}`);
          } catch (error) {
            console.error('[Test Quality] Error writing file:', error.message);
          }
          
          return null;
        }
      });

      return config;
    }
  },
});
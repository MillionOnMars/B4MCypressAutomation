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
            }))
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
          console.log('Test Results Summary:');
          console.log('=====================');
          console.log(`Total: ${summary.totalTests}`);
          console.log(`Passed: ${summary.totalPassed}`);
          console.log(`Failed: ${summary.totalFailed}`);
          console.log(`Pending: ${summary.totalPending}`);
          console.log(`Skipped: ${summary.totalSkipped}`);
          console.log('=====================');
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
              // By Category
              selectorIssues: 0,
              dataValidation: 0,
              visibilityIssues: 0,
              performance: 0,
              
              // By Type (legacy support)
              fragileSelectors: 0,
              missingTestIds: 0,
              missingAriaLabels: 0,
              contentNotFound: 0,
              elementNotFound: 0,
              
              // By Severity
              high: 0,
              medium: 0
            }
          };
          
          if (fs.existsSync(filePath)) {
            existingData = JSON.parse(fs.readFileSync(filePath));
          }

          // Deduplicate existing issues based on type, suite, and test
          // but preserve all fields in the stored issues
          const existingMap = new Map();
          existingData.issues.forEach(issue => {
            const key = `${issue.type}|${issue.category}|${issue.suite}|${issue.test}`;
            existingMap.set(key, issue);
          });

          // Add new unique issues (keeping all fields)
          for (const issue of newIssues) {
            const key = `${issue.type}|${issue.category}|${issue.suite}|${issue.test}`;
            if (!existingMap.has(key)) {
              existingMap.set(key, issue);
            }
          }

          const allIssues = Array.from(existingMap.values());

          // Calculate summary statistics by category and type
          const summary = {
            // By Category
            selectorIssues: allIssues.filter(i => i && i.category === 'Selector Issue').length,
            dataValidation: allIssues.filter(i => i && i.category === 'Data Validation').length,
            visibilityIssues: allIssues.filter(i => i && i.category === 'Visibility Issue').length,
            performance: allIssues.filter(i => i && i.category === 'Performance').length,
            
            // By Type (legacy support)
            fragileSelectors: allIssues.filter(i => 
              i && i.type && i.type.includes('Fragile')).length,
            missingTestIds: allIssues.filter(i => 
              i && i.type === 'Missing Test ID').length,
            missingAriaLabels: allIssues.filter(i => 
              i && i.type === 'Missing Aria Label').length,
            contentNotFound: allIssues.filter(i => 
              i && i.type === 'Content Not Found').length,
            elementNotFound: allIssues.filter(i => 
              i && i.type === 'Element Not Found').length,
            
            // By Severity
            high: allIssues.filter(i => i && i.severity === 'high').length,
            medium: allIssues.filter(i => i && i.severity === 'medium').length
          };

          // Write deduplicated issues
          const updatedData = {
            lastUpdate: new Date().toISOString(),
            totalIssues: allIssues.length,
            summary,
            issues: allIssues
          };

          fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
          return null;
        }
      });

      return config;
    }
  },
});
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
      'cypress/e2e/Prompts.cy.js'
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
        }
      });

      return config;
    }
  },
});
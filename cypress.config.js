const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');

// Define global environment URLs
const environments = {
  staging: 'https://app.staging.bike4mind.com/',
  production: 'https://app.bike4mind.com/'
};

module.exports = defineConfig({
  retries: 0,
  e2e: {    
    specPattern: [
      'cypress/e2e/Auth.cy.js',
      'cypress/e2e/Signup.cy.js'
      // 'cypress/e2e/Projects.cy.js',
      // 'cypress/e2e/Notebook.cy.js',
      // 'cypress/e2e/Prompts.cy.js'
    ],
    supportFile: 'cypress/support/index.js',
    env: {
      //set appURL to production or staging
      appUrl: process.env.CYPRESS_APP_URL || environments.staging
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on, config) {
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
    }
  },
});

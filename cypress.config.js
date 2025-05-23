const { defineConfig } = require("cypress");

// Define global environment URLs
const environments = {
  staging: 'https://app.staging.bike4mind.com/',
  production: 'https://app.bike4mind.com/'
};

module.exports = defineConfig({
  e2e: {    
    specPattern: [
      'cypress/e2e/Auth.cy.js'
      // 'cypress/e2e/Signup.cy.js',
      // 'cypress/e2e/Projects.cy.js',
      // 'cypress/e2e/Notebook.cy.js',
      // 'cypress/e2e/30Prompts.cy.js'
    ],
    supportFile: 'cypress/support/index.js',
    env: {
      //set appURL to production or staging
      appUrl: process.env.CYPRESS_APP_URL || environments.staging
    },
  },
});

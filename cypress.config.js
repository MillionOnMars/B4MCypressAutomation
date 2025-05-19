const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {    
    specPattern: [
      'cypress/e2e/Auth.cy.js',
      'cypress/e2e/Signup.cy.js',
      'cypress/e2e/Projects.cy.js',
      'cypress/e2e/Notebook.cy.js',
      'cypress/e2e/30Prompts.cy.js'
    ],
    supportFile: 'cypress/support/index.js',
    env: {
      appUrl: process.env.CYPRESS_APP_URL || 'https://app.staging.bike4mind.com/'
    },
  },
});

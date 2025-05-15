const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {    
    specPattern: [
      // 'cypress/e2e/Auth.cy.js',
      // 'cypress/e2e/Signup.cy.js',
      // 'cypress/e2e/Projects.cy.js',
      // 'cypress/e2e/Notebook.cy.js'
      // 'cypress/e2e/30Prompts.cy.js',
      'cypress/e2e/30Prompts.cy.js'
    ],
    supportFile: 'cypress/support/index.js',
    setupNodeEvents(on, config) {
      on('after:spec', (spec, results) => {
        // You can add logic here if needed
      });
    }
  },
});

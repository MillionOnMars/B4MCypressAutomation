// filepath: /Users/Automation/Documents/my-cypress-project/cypress/support/index.js
Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        // Returning false here prevents Cypress from failing the test
        return false;
    }
});

Cypress.on('uncaught:exception', (err) => {
    // Ignore the Service Worker registration error
    if (err.message.includes('Failed to register a ServiceWorker')) {
        return false; // Prevent Cypress from failing the test
    }
});

let consoleErrors = [];

Cypress.on('window:before:load', (win) => {
  const originalError = win.console.error;
  win.console.error = function (...args) {
    consoleErrors.push(args.join(' '));
    if (originalError) {
      originalError.apply(win.console, args);
    }
  };
});

afterEach(() => {
  if (consoleErrors.length) {
    cy.writeFile('cypress/fixtures/console-errors.json', consoleErrors, { flag: 'a+' });
    consoleErrors = [];
  }
});
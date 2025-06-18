import './commands';
import { setupGlobalErrorTracking } from './consoleErrorTracker';
require('cypress-xpath');

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

// Set up global error tracking for all tests
setupGlobalErrorTracking();

// Add custom error handling for uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
    // Log the error to our console errors file
    cy.writeFile('cypress/reports/consoleErrors.json', {
        type: 'Uncaught Exception',
        message: err.message,
        timestamp: new Date().toISOString(),
        stack: err.stack
    }, { flag: 'a+' });
    
    return false;
});

// Cypress.Cookies.defaults({
//     preserve: 'sessionid',
// })
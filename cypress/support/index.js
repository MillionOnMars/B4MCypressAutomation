import './commands';
import { setupGlobalErrorTracking } from './consoleErrorTracker';
require('cypress-xpath');

// Storage for uncaught exceptions (in-memory)
const uncaughtExceptions = [];

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
    // Store the error in memory (cannot use cy commands inside event handlers)
    uncaughtExceptions.push({
        type: 'Uncaught Exception',
        message: err.message,
        timestamp: new Date().toISOString(),
        stack: err.stack
    });
    
    console.log('Uncaught Exception:', err.message);
    
    return false;
});

// Write stored exceptions to file after each test
afterEach(function() {
    if (uncaughtExceptions.length > 0) {
        const testInfo = {
            test: this.currentTest?.title || 'Unknown Test',
            suite: this.currentTest?.parent?.title || 'Unknown Suite'
        };
        
        // Add test context to each error
        const errorsWithContext = uncaughtExceptions.map(err => ({
            ...err,
            ...testInfo
        }));
        
        cy.task('updateErrorLog', {
            filePath: 'cypress/reports/consoleErrors.json',
            newErrors: errorsWithContext
        });
        
        // Clear the array for the next test
        uncaughtExceptions.length = 0;
    }
});

// Cypress.Cookies.defaults({
//     preserve: 'sessionid',
// })
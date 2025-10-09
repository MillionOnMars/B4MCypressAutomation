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
Cypress.on('uncaught:exception', (err, runnable) => {
    // Ignore React minified errors during tests
    if (err.message.includes('Minified React error')) {
        console.warn('Suppressed React error:', err.message)
        return false  // Prevent test failure
    }
    
    // Let other errors fail tests
    return true
})
// Cypress.Cookies.defaults({
//     preserve: 'sessionid',
// })
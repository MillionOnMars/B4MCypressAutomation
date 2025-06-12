export const setupGlobalErrorTracking = () => {
    // Use closure to maintain errors across suite runs
    const errorFilePath = 'cypress/reports/consoleErrors.json';
    let globalErrors = new Set();

    // Initialize once at start of all tests
    before(() => {
        // Clear the set
        globalErrors.clear();
        
        // Initialize error file
        cy.task('writeFile', {
            filePath: errorFilePath,
            content: { errors: [], totalErrors: 0 }
        });
    });

    beforeEach(() => {
        Cypress.on('window:before:load', (win) => {
            const originalConsole = {
                error: win.console.error,
                warn: win.console.warn
            };

            win.console.error = (...args) => {
                const errorMessage = args.map(arg => {
                    try {
                        return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch (e) {
                        return arg.toString();
                    }
                }).join(' ');

                // Create error object
                const error = {
                    type: 'Console Error',
                    message: errorMessage,
                    timestamp: new Date().toISOString(),
                    suite: Cypress.currentTest?.titlePath?.[0] || 'Unknown Suite',
                    test: Cypress.currentTest?.title || 'Unknown Test'
                };

                // Create unique key for deduplication
                const errorKey = JSON.stringify({
                    message: error.message,
                    suite: error.suite,
                    test: error.test
                });

                // Add to global set
                globalErrors.add(errorKey);
                
                // Call original console.error
                originalConsole.error.apply(win.console, args);
            };
        });
    });

    // Update error file after each test
    afterEach(() => {
        if (globalErrors.size > 0) {
            // Convert Set to array of parsed errors
            const uniqueErrors = Array.from(globalErrors).map(errorKey => JSON.parse(errorKey));
            
            cy.task('updateErrorLog', {
                filePath: errorFilePath,
                newErrors: uniqueErrors,
                append: true  // Indicate we want to append errors
            }).then(() => {
                cy.log(`Total unique console errors: ${globalErrors.size}`);
            });
        }
    });

    // Final error summary after all tests
    after(() => {
        cy.log(`Final error count: ${globalErrors.size}`);
        globalErrors.clear();
    });
};
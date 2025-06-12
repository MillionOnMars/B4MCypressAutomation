export const setupGlobalErrorTracking = () => {
    let errors = new Set(); // Use Set to prevent duplicates
    const errorFilePath = 'cypress/reports/consoleErrors.json';

    before(() => {
        cy.task('writeFile', {
            filePath: errorFilePath,
            content: { errors: [], totalErrors: 0 }
        });
    });

    beforeEach(() => {
        errors.clear(); // Clear errors Set

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

                // Only add if not already present
                errors.add(errorKey);
                
                originalConsole.error.apply(win.console, args);
            };
        });
    });

    afterEach(() => {
        if (errors.size > 0) {
            // Convert Set back to array and deduplicate
            const uniqueErrors = Array.from(errors).map(errorKey => JSON.parse(errorKey));
            
            cy.task('updateErrorLog', {
                filePath: errorFilePath,
                newErrors: uniqueErrors
            }).then(() => {
                cy.log(`Processed ${uniqueErrors.length} unique console messages`);
                errors.clear();
            });
        }
    });
};
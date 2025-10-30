// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('verifyPageLoad', (url) => {
    cy.intercept('GET', '**/auth/me').as('authCheck');
    cy.visit(url, {
        timeout: 10000,
        onBeforeLoad: (win) => {
            win.sessionStorage.clear();
        },
    });
    cy.wait('@authCheck')
        .its('response.statusCode')
        .should('be.oneOf', [200, 401]); // Accept both authenticated and non-authenticated responses
});

/**
 * Verify answer(s) in the UI with AND/OR logic support
 * @param {string|Array} answers - Single answer string or array of answers
 * @param {Object} options - Configuration options
 * @param {string} options.logic - 'and' (default) or 'or' - how to match array answers
 * @param {string} options.selector - CSS selector to search within (default: 'body')
 * @param {number} options.timeout - Timeout in milliseconds (default: 50000)
 * @param {boolean} options.matchCase - Case sensitive matching (default: false)
 */
Cypress.Commands.add('verifyAnswers', (answers, options = {}) => {
    const {
        logic = 'and',
        selector = 'body',
        timeout = 50000,
        matchCase = false
    } = options;

    if (Array.isArray(answers)) {
        if (logic === 'or') {
            // OR logic: at least one answer should be visible
            cy.get(selector, { timeout }).then(($element) => {
                const elementText = matchCase ? $element.text() : $element.text().toLowerCase();
                const found = answers.some((answer) => {
                    const searchText = matchCase ? answer : answer.toLowerCase();
                    return elementText.includes(searchText);
                });
                expect(found, `At least one of [${answers.join(', ')}] should be visible in ${selector}`).to.be.true;
            });
        } else {
            // AND logic: all answers should be visible
            answers.forEach((answer) => {
                cy.get(selector, { timeout })
                    .contains(answer, { timeout, matchCase })
                    .should('be.visible');
            });
        }
    } else {
        // Single answer
        cy.get(selector, { timeout })
            .contains(answers, { timeout, matchCase })
            .should('be.visible');
    }
});

/**
 * Final verification step for E2E tests - failures are categorized as LIKELY_BUG
 * Use this for the final assertion in your test workflow where failure indicates a real application bug
 *
 * @param {string} selector - Primary selector (e.g., '[data-testid="success-message"]')
 * @param {Object} options - Configuration options
 * @param {string} options.expectedText - Expected text/content to verify (optional)
 * @param {Array<string>} options.fallbackSelectors - Alternative selectors to try if primary fails (optional)
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @param {boolean} options.matchCase - Case sensitive matching for text (default: false)
 *
 * @example
 * // Basic usage with test ID
 * cy.finalCheck('[data-testid="success-message"]', {
 *   expectedText: 'Sent an invite to the selected users'
 * })
 *
 * @example
 * // With fallback selectors
 * cy.finalCheck('[data-testid="success-message"]', {
 *   expectedText: 'Invite sent',
 *   fallbackSelectors: ['.success-notification', '.toast-success']
 * })
 */
Cypress.Commands.add('finalCheck', (selector, options = {}) => {
    const {
        expectedText = null,
        fallbackSelectors = [],
        timeout = 10000,
        matchCase = false
    } = options;

    // Create array of all selectors to try (primary + fallbacks)
    const allSelectors = [selector, ...fallbackSelectors];
    let attemptedSelectors = [];
    let lastError = null;

    // Try each selector in sequence
    const trySelector = (currentSelector, index) => {
        attemptedSelectors.push(currentSelector);

        return cy.get('body', { timeout: 1000, log: false }).then(() => {
            return cy.get(currentSelector, { timeout: index === 0 ? timeout : 2000, log: false })
                .then(($element) => {
                    // Element found - verify text if provided
                    if (expectedText) {
                        const elementText = matchCase ? $element.text() : $element.text().toLowerCase();
                        const searchText = matchCase ? expectedText : expectedText.toLowerCase();

                        if (elementText.includes(searchText)) {
                            cy.log(`✓ Final check passed: Found "${expectedText}" in ${currentSelector}`);
                            return cy.wrap($element).should('be.visible');
                        } else {
                            // Element exists but missing expected text - this is a BUG
                            throw new Error(
                                `[FINAL_CHECK_BUG] Element found at "${currentSelector}" but missing expected text: "${expectedText}". ` +
                                `Actual text: "${$element.text().substring(0, 100)}"`
                            );
                        }
                    } else {
                        // No text verification - just check visibility
                        cy.log(`✓ Final check passed: Found ${currentSelector}`);
                        return cy.wrap($element).should('be.visible');
                    }
                })
                .catch((error) => {
                    lastError = error;
                    // Try next selector if available
                    if (index < allSelectors.length - 1) {
                        return trySelector(allSelectors[index + 1], index + 1);
                    } else {
                        // All selectors failed - this is a BUG not a selector issue
                        throw new Error(
                            `[FINAL_CHECK_BUG] Final verification failed - likely application bug. ` +
                            `Expected element: "${selector}". ` +
                            (expectedText ? `Expected text: "${expectedText}". ` : '') +
                            `Tried ${attemptedSelectors.length} selector(s): [${attemptedSelectors.join(', ')}]. ` +
                            `Original error: ${lastError.message}`
                        );
                    }
                });
        });
    };

    return trySelector(allSelectors[0], 0);
});
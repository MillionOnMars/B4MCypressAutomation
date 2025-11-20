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
 * Self-healing selector command for Profile dropdown selection
 * Specifically handles MUI Select dropdowns with multiple fallback strategies
 * @param {string} text - Text content to find in the dropdown
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Timeout in milliseconds (default: 10000)
 * @returns {Cypress.Chainable} Cypress chainable for the found element
 */
Cypress.Commands.add('healSelect', (text, options = {}) => {
    const { timeout = 10000 } = options;
    
    cy.log(`🔍 Prompt: Looking for "${text}" in dropdown`);

    // Strategy 1: Try to find in listbox (MUI Select pattern)
    // First check if listbox exists, then try to find the text
    return cy.get('body', { timeout: 2000 }).then(($body) => {
        const listboxExists = $body.find('[role="listbox"]').length > 0;
        
        if (listboxExists) {
            cy.log(`   Found listbox, searching for "${text}"`);
            // Try to find the option - use force click since listbox might be in portal
            return cy.get('[role="listbox"]', { timeout })
                .contains('li', text, { timeout, matchCase: false })
                .click({ force: true });
        } else {
            // Strategy 2: Fallback to general text search
            cy.log(`   Listbox not found, trying general text search`);
            return cy.contains(text, { timeout, matchCase: false })
                .click({ force: true });
        }
    });
});
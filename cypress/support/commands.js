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
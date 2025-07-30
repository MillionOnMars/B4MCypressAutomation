export function login(username, password) {
    // Visit the Bike4mind URL with increased pageLoadTimeout
    cy.visit(Cypress.env('appUrl'), { timeout: 60000 })

    // Wait for page to be ready
    cy.document({ timeout: 60000 }).should('have.property', 'readyState', 'complete');

    // Enhanced login flow with retry-ability and better timeouts
    cy.get('[name="username"]', { timeout: 60000 })
        .should('exist')
        .should('be.visible')
        .should('be.enabled')
        .clear()
        .type(username, { delay: 50 });

    cy.get('[name="password"]', { timeout: 20000 })
        .should('exist')
        .should('be.visible')
        .should('be.enabled')
        .clear()
        .type(password, { delay: 50 });

    cy.get('button[type="submit"]', { timeout: 20000 })
        .should('exist')
        .should('be.visible')
        .should('be.enabled')
        .click();

    // Enhanced login verification
    cy.url({ timeout: 20000 })
        .should('include', '/new')
        .then((url) => {
            cy.log(`Successfully logged in, current URL: ${url}`);
        });
}
export function login(username, password) {

      cy.visit(Cypress.env('appUrl'))
      cy.get('[name="username"]', { timeout: 10000 })
        .should('be.visible')
        .type(username);
      cy.get('[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.wait(5000)
          // Wait for the dashboard or a specific element to confirm login
    cy.url().should('include', '/new'); // Replace '/dashboard' with the actual URL after login

}
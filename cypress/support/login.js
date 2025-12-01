export function login(username, password) {
  // Visit the Bike4mind URL
  cy.visit(Cypress.env('appUrl'));

  cy.wait(5000);

  // Wait for the page to load and check if we're on the login page
  cy.url().then(url => {
    cy.log('Current URL:', url);

    // Check if we're on login page by looking for login elements
    cy.get('body').then($body => {
      const hasLoginForm = $body.find('[name="username"]').length > 0;
      cy.log('Has login form:', hasLoginForm);

      if (url.includes('/login') || hasLoginForm) {
        // Login flow with proper timeouts
        cy.get('[name="username"]', { timeout: 10000 })
          .should('be.visible')
          .type(username);
        cy.get('button[type="submit"]', { timeout: 10000 })
          .should('be.visible')
          .click();
        cy.get('[name="password"]', { timeout: 10000 })
          .should('be.visible')
          .type(password);
        cy.get('button[type="submit"]', { timeout: 10000 })
          .should('be.visible')
          .click();

        // Verify successful login after logging in
        cy.url({ timeout: 30000 }).should('include', '/new');
      } else {
        cy.log('Already logged in, skipping login flow');
      }

      // Check if "What's New" modal is present and close it
      cy.handleWhatsNewModal();
    });
  });
}

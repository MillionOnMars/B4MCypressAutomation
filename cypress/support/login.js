export function login(username, password) {

      cy.visit('https://app.bike4mind.com/login');
      cy.get('[name="username"]').type(username);
      cy.get('[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.wait(5000)
          // Wait for the dashboard or a specific element to confirm login
    cy.url().should('include', '/new'); // Replace '/dashboard' with the actual URL after login

}

const DEFAULT_TIMEOUT = 10000;

const searchUser = (username, email) => {

    // Navigate to the admin panel
    cy.get('[aria-label="Profile"]')
        .should('be.visible')
        .click();
    // Ensure the admin panel is loaded
    cy.url()
        .should('include', '/profile', { timeout: DEFAULT_TIMEOUT });
    //click admin tab
    cy.contains('Admin')
        .should('be.visible')
        .click();
    //click admin dashboard
    cy.contains('Admin Dashboard')
        .should('be.visible')
        .click();
    // Ensure the admin dashboard is loaded
    cy.url()
        .should('include', '/admin', { timeout: DEFAULT_TIMEOUT });
    // Search for the user
    cy.get('input[placeholder="Search users"]')
        .should('be.visible')
        .type(username);
    // Verify the user appears in the search results
    cy.contains(email, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
}

class Admin {
    static User(username, email) {
        describe('User Tests', () => {
            it(`Search for user: ${username}`, () => {
                searchUser(username, email);
            });
        });
    }
}
export default Admin;
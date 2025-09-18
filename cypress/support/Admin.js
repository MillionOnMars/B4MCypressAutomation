const DEFAULT_TIMEOUT = 10000;

// Function to navigate to the Admin Dashboard
const navigateToAdminDashboard = () => {
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
}

const searchUser = (username, email) => {
    navigateToAdminDashboard(); // Call the navigation function
    // Search for the user
    cy.get('input[placeholder="Search users"]')
        .should('be.visible')
        .type(username);
    // Verify the user appears in the search results
    cy.contains(username, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    cy.contains(email, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
}

const sortname = (username, sortBy) => {
    navigateToAdminDashboard(); // Call the navigation function
    cy.log("Sorting by:", sortBy);
    // Click Sort Combobox
    cy.get('button[role="combobox"]')
        .contains('Created At')
        .should('be.visible')
        .click();
    // Click the "Name" option in the dropdown, scoped to the open listbox
    cy.get('[role="listbox"]')
        .contains(String(sortBy)) // Convert sortBy to a string
        .should('be.visible')
        .click();
    //Click order to change to A-Z
    cy.contains('button', 'Z → A')
        .should('be.visible')
        .click();
    // Verify that username is visible in the results
    cy.get('.MuiGrid-spacing-xs-2').eq(2)
        .contains(username, { timeout: DEFAULT_TIMEOUT })
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
    static Sort(username, sortBy) {
        describe('Sort Tests', () => {
            it('Sort users', () => {
                sortname(username, sortBy);
            });
        });
    }
}
export default Admin;
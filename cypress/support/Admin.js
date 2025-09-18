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
const CreateUser = (userDetails) => {
    navigateToAdminDashboard();
    //Click Bulk Import
    cy.contains('Bulk Import')
        .should('be.visible')
        .click();
    //Add CSV data
    cy.get('textarea[placeholder="Paste CSV data here..."]')
        .should('be.visible')
        .type(userDetails);
    //Click Import Users
    cy.contains('button', 'Import Users')
        .should('be.visible')
        .click();
    //Verify success message
    cy.contains('User created successfully', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
}
const EditUser = (oldName, newName, newEmail) => {
    navigateToAdminDashboard();
    // Search for the user to edit
    cy.get('input[placeholder="Search users"]')
        .should('be.visible')
        .type(oldName);
    cy.contains(oldName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Click profile button
    cy.xpath("//button[normalize-space()='Profile']")
        .should('be.visible')
        .click();
    // Edit user details
    cy.get('input[name="name"]')
        .clear()
        .type(newName);
    cy.get('input[name="email"]')
        .clear()
        .type(newEmail);
    // Save changes
    cy.contains('button', 'Save Changes')
        .should('be.visible')
        .click();
    // Verify success message
    cy.contains('Profile updated successfully', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
}
const DeleteUser = (username) => {
    navigateToAdminDashboard();
    // Search for the user to delete
    cy.get('input[placeholder="Search users"]')
        .should('be.visible')
        .type(username);
    cy.contains(username, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Click admin button
    cy.xpath("//button[normalize-space()='Admin']")
        .should('be.visible')
        .click();
    //Type DELETE in confirmation box
    cy.get('input[placeholder="type DELETE"]')
        .should('be.visible')
        .type('DELETE');
    //Click Delete User button
    cy.contains('button', 'Delete User')
        .should('be.visible')
        .click();
    //Click Delete button in popup
    cy.get('div[role="dialog"]')
        .find('button.MuiButton-colorDanger')
        .last() // Target the last matching element
        .should('be.visible')
        .click();
    //Verify success message
    cy.contains('User deleted successfully', { timeout: DEFAULT_TIMEOUT })
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
    static CreateUser(userDetails) {
        describe('Create User Tests', () => {
            it('Create user', () => {
                CreateUser(userDetails);
            });
        });
    }
    static EditUser(oldName, newName, newEmail) {
        describe('Edit User Tests', () => {
            it('Edit user', () => {
                EditUser(oldName, newName, newEmail);
            });
        });
    }
    static DeleteUser(username) {
        describe('Delete User Tests', () => {
            it('Delete user', () => {
                DeleteUser(username);
            });
        });
    }
}
export default Admin;
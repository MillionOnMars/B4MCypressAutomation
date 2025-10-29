const DEFAULT_TIMEOUT = 15000;

// Function to navigate to the Admin Dashboard
const navigateToAdminDashboard = () => {
    // Wait for user menu button and force click
    cy.get('[data-testid="notebook-sidenav-footer-menu-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('exist')
        .click();
    // Click admin option
    cy.contains('Admin', { timeout: DEFAULT_TIMEOUT })
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
    
    // Map sortBy value to the correct data-testid
    const sortTestIdMap = {
        'Name': 'sort-option-name',
        'Created At': 'sort-option-created-at'
    };
    
    // Click Sort Combobox
    cy.get('[data-testid="admin-sort-by-select"]')
        .should('be.visible')
        .click();
    
    // Wait for the dropdown to open and click the sort option using data-testid
    cy.get(`[data-testid="${sortTestIdMap[sortBy]}"]`, { timeout: DEFAULT_TIMEOUT })
        .should('exist')
        .click({ force: true });
    
    //Click order to change to A-Z
    cy.get('[data-testid="admin-sort-order-button"]')
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
const EditUser = (user) => {
    navigateToAdminDashboard();
    // Search for the user to edit
    cy.get('input[placeholder="Search users"]')
        .should('be.visible')
        .type(user.oldName);
    cy.contains(user.oldName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Click profile button
    cy.xpath("//button[normalize-space()='Profile']")
        .should('be.visible')
        .click();
    // Edit name
    cy.get('input[name="name"]')
        .clear()
        .type(user.newName);
    //Edit email
    cy.get('input[name="email"]')
        .clear()
        .type(user.newEmail);
    //Edit team
    cy.get('input[name="team"]')
        .clear()
        .type(user.newTeam);
    //Edit role
    cy.get('input[name="role"]')
        .clear()
        .type(user.newRole);
    //Edit phone
    cy.get('input[name="phone"]')
        .clear()
        .type(user.phone);
    //Select Preferred Contact Method
    cy.get('button[role="combobox"]')
        .contains('None')
        .should('be.visible')
        .click();
    cy.get('[role="listbox"]')
        .contains(user["preferredContact"])
        .should('be.visible')
        .click();
    //Select T-shirt Size
    cy.get('button[role="combobox"]')
        .contains('None')
        .should('be.visible')
        .click();
    cy.get('[role="listbox"]')
        .contains(user["tShirtSize"])
        .should('be.visible')
        .click();
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
let inviteCode;
const CreateInviteCode = (createdby) => {
    inviteCode = null;
    navigateToAdminDashboard();
    //Click Invite Codes tab
    cy.contains('Invite Codes')
        .should('be.visible')
        .click();
    //Click Create button
    cy.xpath("//button[normalize-space()='Create']")
        .should('be.visible')
        .click();
    //Click submit button
    cy.contains('button', 'Submit')
        .should('be.visible')
        .click();
    //Verify success message
    cy.contains('Registration invite(s) created', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    //Verify created by
    cy.contains(createdby, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    //Copy invite code
    cy.get('div[aria-label="Click to Copy"]')
        .eq(0) // Get the first invite code in the list
        .invoke('text')
        .then((text) => {
            inviteCode = text;
            cy.log('Invite Code:', inviteCode);
        });
}
const UseInviteCode = (username, email, password, fullname) => {
    // Wait for user menu button and force click
    cy.get('[data-testid="notebook-sidenav-footer-menu-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('exist')
        .click();
    // Wait for logout icon and force click
    cy.get('[data-testid="LogoutIcon"]')
        .should('exist')
        .click({ force: true });
    // Ensure logout is successful 
    cy.contains('Bike4Mind', { timeout: DEFAULT_TIMEOUT })
        .should('exist');
    cy.url().should('contain', '/login');
    // Navigate to the signup page
    cy.get('button').contains('Sign Up')
        .should('be.visible')
        .click();
    // Ensure the signup page is loaded
    cy.url()
        .should('include', '/register', { timeout: DEFAULT_TIMEOUT });
    // Enter the invite code
    cy.get('input[name="inviteCode"]')
        .should('be.visible')
        .type(inviteCode);
    // Fill out the rest of the registration form
    cy.get('#username').should('be.visible').type(username);
    cy.get('.MuiInput-root > #email').should('be.visible').type(email);
    cy.get('#password').should('be.visible').type(password);
    cy.get('#confirmPassword').should('be.visible').type(password);
    cy.get('.MuiInput-root > #fullName').should('be.visible').type(fullname);
    // Submit the form
    cy.get('	.MuiButton-fullWidth').should('be.visible').click();
}
const DeleteInviteCode = (username) => {
    //Delete user created with invite code 
    DeleteUser(username);
    //Click escape to close any open dialogs
    cy.get('body').type('{esc}');
    //Click Invite Codes tab
    cy.contains('Invite Codes')
        .should('be.visible')
        .click();
    //Click Delete button
    cy.get('[data-testid="DeleteForeverIcon"]')
        .eq(0) // Target the first matching element
        .should('be.visible')
        .click();
    //Verify success message
    cy.contains('Registration invite(s) deleted', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
}

const initialCleanup = (username) => {
    navigateToAdminDashboard();
    // Search for the user to delete
    cy.get('input[placeholder="Search users"]', { timeout: DEFAULT_TIMEOUT })
    .should('be.visible')
    .type(username);

    // Check for user in results wait for 10 seconds
    cy.wait(10000);

    // Check for user in results
    cy.get('body').then($body => {
        if ($body.find(`[aria-label="${username}"]`).length > 0) {
        
            // clear search
            cy.get('input[placeholder="Search users"]', { timeout: DEFAULT_TIMEOUT })
            .should('be.visible')
            .clear();
             // close admin dashboard
            cy.get('[data-testid="close-admin-page-banner-btn"]')
                .should('be.visible')
                .click();

            // delete user
            DeleteUser(username);
        }
    });
}

class Admin {

    static InitialCleanup(username) {
        describe('Initial Cleanup Tests', () => {
            it('Initial cleanup', () => {
                initialCleanup(username);
            });
        });
    }

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
    static EditUser() {
        describe('Edit User Tests', () => {
            it('Edit user', () => {
                cy.fixture('edit-user.json').then((editUserData) => {
                    editUserData.forEach((user) => {
                        EditUser(user);
                    });
                });
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
    static CreateInviteCode(createdby) {
        describe('Create Invite Code Tests', () => {
            it('Create invite code', () => {
                CreateInviteCode(createdby);
            });
        });
    }
    static UseInviteCode() {
        describe('Use Invite Code Tests', () => {
            it('Use invite code', () => {
                cy.fixture('accounts.json').then((accounts) => {
                    const user4 = accounts.newUsers.user4;
                    UseInviteCode(user4.username, user4.email, user4.password, user4.fullname);
                });
            });
        });
    }
    static DeleteInviteCode(username) {
        describe('Delete Invite Code Tests', () => {
            it('Delete invite code', () => {
                DeleteInviteCode(username);
            });
        });
    }

}
export default Admin;
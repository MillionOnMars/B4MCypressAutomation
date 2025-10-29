const DEFAULT_TIMEOUT = 30000;

export const openProfileTabs = (tab) => {
    // Click profile button 
    cy.get('.notebook-sidenav-footer-profile-button', { timeout: DEFAULT_TIMEOUT }
    ).should('be.visible')
        .click();
    // Click on the specified tab
    cy.contains('.MuiTab-colorNeutral', tab, { timeout: DEFAULT_TIMEOUT })
        .click({ force: true });
};

// Register in Cypress command
Cypress.Commands.add('setProfileSettings', openProfileTabs);

const navigateToProfileSettings = () => {
    // Navigate to Profile Settings
    cy.get('[aria-label="Profile"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    // Ensure the profile page is loaded
    cy.url()
        .should('include', '/profile', { timeout: DEFAULT_TIMEOUT });
};

const UpdateUserSettings = (user) => {
    navigateToProfileSettings();
    // Click on Edit Profile button
    cy.contains('Edit Profile', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Update User Settings
    // Edit name
    cy.get('input[name="name"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
        .type(user.newName);
    //Edit email
    cy.get('input[name="email"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
        .type(user.newEmail);
    //Edit team
    cy.get('input[name="team"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
        .type(user.newTeam);
    //Edit role
    cy.get('input[name="role"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
        .type(user.newRole);
    //Edit phone
    cy.get('input[name="phone"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
        .type(user.phone);
    //Select Preferred Contact Method
    cy.get('.profile-data-form-label')
        .contains('Preferred Contact:')
        .parent()
        .find('[role="combobox"]')
        .click();

    cy.get('[role="listbox"]')
        .contains(user["preferredContact"])
        .should('be.visible')
        .click();
    //Click Save Changes
    cy.contains('button', 'Save Changes', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Verify success message
    cy.contains('Profile updated successfully', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');

};

const RevertUserSettings = (user) => {
    navigateToProfileSettings();
    // Click on Edit Profile button
    cy.contains('Edit Profile', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Revert User Settings
    // Edit name
    cy.get('input[name="name"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
        .type(user.originalName);
    //Edit email
    cy.get('input[name="email"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
        .type(user.originalEmail);
    //Edit team
    cy.get('input[name="team"]', { timeout: DEFAULT_TIMEOUT }               )
        .clear()
    //Edit role
    cy.get('input[name="role"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
    //Edit phone
    cy.get('input[name="phone"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
    //Select Preferred Contact Method
    cy.get('.profile-data-form-label')
        .contains('Preferred Contact:')
        .parent()
        .find('[role="combobox"]')
        .click();

     // Select the option (with fallback to 'Email' if preferredContact is missing)
    const preferredContact = user.preferredContact || 'Email';
        cy.get('[role="option"]')
        .contains(preferredContact)
        .click();
    //Click Save Changes
    cy.contains('button', 'Save Changes', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Verify success message
    cy.contains('Profile updated successfully', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');

}
const verifyProfileElements = () => {
    navigateToProfileSettings();
    // Verify presence of Credits
    cy.contains('Credits', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    cy.get('.profile-detail-tab-value')
        .should('be.visible');
    // Verify presence of Storage Used
    cy.contains('Storage Used', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    cy.get('.profile-detail-tab-storage-value', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    // Verify the presence of the Collections element
    cy.contains('Collection', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    cy.get('.profile-collection-section-item', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
};

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

const initialCleanup = (user) => {
    const username = user.newName;

    // go to admin
    navigateToAdminDashboard();

    cy.get('input[placeholder="Search users"]', { timeout: DEFAULT_TIMEOUT })
    .should('be.visible')
    .type(username);

    // Check for user in results wait for 10 seconds
    cy.wait(10000);

    // Check for user in results
    cy.get('body').then($body => {
        if ($body.find(`[aria-label="${username}"]`).length > 0) {
            // close admin dashboard
            cy.get('[data-testid="close-admin-page-banner-btn"]')
                .should('be.visible')
                .click();

            // navigate to profile
            navigateToProfileSettings();

            // revert
            RevertUserSettings(user);
        }
    });
}


class Profile {
    static ClearUsernameOrEmail() {
        describe('Cleanup / Revert Username if previous revert failed', () => {
            it('Clear username or email', () => {
                cy.fixture('edit-user.json').then((editUserData) => {
                    editUserData.forEach((user) => {
                        initialCleanup(user);
                    });
                });
            });
        });
    }
    static openProfileTab(tabName) {
        it(`Should open the ${tabName} tab in profile`, () => {
            openProfileTabs(tabName);
        });
    }
    static UpdateUserSettings() {
        describe('Update User Settings Tests', () => {
            it('Update user settings', () => {
                cy.fixture('edit-user.json').then((editUserData) => {
                    editUserData.forEach((user) => {
                        UpdateUserSettings(user);
                    });
                });
            });
        });
    }
    static RevertUserSettings() {
        describe('Revert User Settings Tests', () => {
            it('Revert user settings', () => {
                cy.fixture('edit-user.json').then((revertUserData) => {
                    revertUserData.forEach((user) => {
                        RevertUserSettings(user);
                    });
                });
            });
        });
    }
    static VerifyProfileElements() {
        describe('Verify Profile Elements Tests', () => {
            it('Verify profile elements', () => {
                verifyProfileElements();
            });
        });
    }
}

export default Profile;
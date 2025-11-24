const DEFAULT_TIMEOUT = 30000;

export const openProfileTabs = (tab) => {
    // Click profile button
    cy.get('[data-testid="notebook-sidenav-footer-profile-button"]', { timeout: DEFAULT_TIMEOUT }
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
    cy.get('[data-testid="notebook-sidenav-footer-profile-button"]', { timeout: DEFAULT_TIMEOUT })
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
    cy.get('[data-testid="preferred-contact-selectbox"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click({ force: true });
    cy.get('[role="listbox"]', { timeout: DEFAULT_TIMEOUT })
        .contains(user["preferredContactMethod"])
        .should('be.visible')
        .click();
    //Click Save Changes
    cy.contains('button', 'Save Changes')
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
    //Edit team
    cy.get('input[name="team"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
    //Edit role
    cy.get('input[name="role"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
    //Edit phone
    cy.get('input[name="phone"]', { timeout: DEFAULT_TIMEOUT })
        .clear()
    //Select Preferred Contact Method
    cy.get('[data-testid="preferred-contact-selectbox"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click({ force: true });
    // Select T-shirt Size
    cy.contains('.profile-data-form-label', 'T-shirt Size:', { timeout: DEFAULT_TIMEOUT })
        .parent()
        .find('button[role="combobox"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
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
    cy.get('.profile-detail-tab-value', { timeout: DEFAULT_TIMEOUT })
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

class Profile {
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

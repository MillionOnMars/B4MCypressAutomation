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
    cy.get('[aria-label="Profile"]')
        .should('be.visible')
        .click();
    // Ensure the profile page is loaded
    cy.url()
        .should('include', '/profile', { timeout: DEFAULT_TIMEOUT });
};

const UpdateUserSettings = (user) => {
    navigateToProfileSettings();
    // Click on Edit Profile button
    cy.contains('Edit Profile')
        .should('be.visible')
        .click();
    //Update User Settings
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
    cy.contains('Edit Profile')
        .should('be.visible')
        .click();
    //Revert User Settings
    // Edit name
    cy.get('input[name="name"]')
        .clear()
        .type(user.originalName);
    //Edit email
    cy.get('input[name="email"]')
        .clear()
        .type(user.originalEmail);
    //Edit team
    cy.get('input[name="team"]')
        .clear()
    //Edit role
    cy.get('input[name="role"]')
        .clear()
    //Edit phone
    cy.get('input[name="phone"]')
        .clear()
    //Select Preferred Contact Method
    cy.get('button[role="combobox"]')
        .contains(user["preferredContactMethod"])
        .should('be.visible')
        .click();
    cy.get('[role="listbox"]')
        .contains('None')
        .should('be.visible')
        .click();
    //Click Save Changes
    cy.contains('button', 'Save Changes')
        .should('be.visible')
        .click();
    //Verify success message
    cy.contains('Profile updated successfully', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');

}
const verifyProfileElements = () => {
    navigateToProfileSettings();
    // Verify presence of Credits
    cy.contains('Credits')
        .should('be.visible');
    cy.get('.profile-detail-tab-value')
        .should('be.visible');
    // Verify presence of Storage Used
    cy.contains('Storage Used')
        .should('be.visible');
    cy.get('.profile-detail-tab-storage-value')
        .should('be.visible');
    // Verify the presence of the Collections element
    cy.contains('Collection')
        .should('be.visible');
    cy.get('.profile-collection-section-item')
        .should('be.visible');
};

const toggleExperimentalFeature = (index, EnabledColor, DisabledColor) => {
    // Toggle the feature
    cy.get('div.experimental-feature-toggle-container button')
        .eq(index)
        .should('be.visible')
        .click();

    // Verify the toggle state has changed and the background color is correct
    cy.get('div.experimental-feature-toggle-container button')
        .eq(index)
        .should('have.attr', 'style')
        .then((style) => {
            if (style.includes(EnabledColor)) {
                cy.get('div.experimental-feature-toggle-container button')
                    .eq(index)
                    .should('have.attr', 'style')
                    .and('include', `background-color: ${EnabledColor};`);
            } else {
                cy.get('div.experimental-feature-toggle-container button')
                    .eq(index)
                    .should('have.attr', 'style')
                    .and('include', `background-color: ${DisabledColor};`);
            }
        });
};

const verifyExperimentalFeaturesToggle = (EnabledColor, DisabledColor) => {
    navigateToProfileSettings();
    // Navigate to Settings tab
    openProfileTabs('Settings');

    const features = [
        'Quest Master',
        'Mementos',
        'Artifacts',
        'Agents',
        'Research Mode',
        'Hottest Models'
    ];

    features.forEach((feature, index) => {
        cy.contains(feature)
            .should('be.visible');

        // Toggle the feature ON and verify
        toggleExperimentalFeature(index, EnabledColor, DisabledColor);

        // Toggle the feature OFF and verify
        toggleExperimentalFeature(index, DisabledColor, EnabledColor);
    });
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
    static ToggleExperimentalFeatures(EnabledColor, DisabledColor) {
        describe('Toggle Experimental Features Tests', () => {
            it('Verify Experimental Features toggle', () => {
                verifyExperimentalFeaturesToggle(EnabledColor, DisabledColor);
            });
        });
    }
}

export default Profile;
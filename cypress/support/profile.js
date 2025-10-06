import { timeout } from "async";

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

const toggleExperimentalFeature = (index, EnabledColor, DisabledColor, featureName) => {
    // Toggle the feature
    cy.get('div.experimental-feature-toggle-container button')
        .eq(index)
        .should('be.visible')
        .click();

    // Check that the feature name is visible after toggling
    cy.contains(featureName)
    .scrollIntoView({ duration: 300, timeout: DEFAULT_TIMEOUT })
    .should('be.visible');

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

const verifyQuestMasterFeature = (EnabledColor, DisabledColor) => {
    navigateToProfileSettings();
    // Navigate to Settings tab
    openProfileTabs('Settings');

    const index = 0; // Quest Master is at index 0

    // Helper function to verify Quest Master functionality
    const verifyQuestMasterFunctionality = (shouldExist) => {
        cy.contains('button', 'Chat').click();
        cy.contains('button', 'Tools').click();
        if (shouldExist) {
            cy.contains('div', 'Quest Master').should('be.visible');
        } else {
            cy.contains('div', 'Quest Master').should('not.exist');
        }
    };

    // Toggle Quest Master ON and verify
    toggleExperimentalFeature(index, EnabledColor, DisabledColor, 'Quest Master');
    cy.contains('Quest Master').should('be.visible');
    verifyQuestMasterFunctionality(true);

    // Toggle Quest Master OFF and verify
    navigateToProfileSettings();
    openProfileTabs('Settings');
    toggleExperimentalFeature(index, DisabledColor, EnabledColor, 'Quest Master');
    verifyQuestMasterFunctionality(false);
};

const verifyMementosFeature = (EnabledColor, DisabledColor) => {
    navigateToProfileSettings();
    openProfileTabs('Settings');

    const index = 1; // Mementos is at index 1

    // Helper function to verify Mementos toggle state
    const verifyMementosState = (shouldBeEnabled) => {
        const mementosButtonSelector = 'button[aria-label="Mementos"]';

        if (shouldBeEnabled) {
            cy.contains('button', 'Mementos')
                .scrollIntoView({ duration: 300, timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            cy.get(mementosButtonSelector).should('be.visible');
        } else {
            cy.get(mementosButtonSelector).should('not.exist');
        }
    };

    // Toggle Mementos ON and verify
    toggleExperimentalFeature(index, EnabledColor, DisabledColor, 'Mementos');
    verifyMementosState(true);

    // Toggle Mementos OFF and verify
    toggleExperimentalFeature(index, DisabledColor, EnabledColor, 'Mementos');
    verifyMementosState(false);
};

const verifArtifactsFeature = (EnabledColor, DisabledColor) => {
    navigateToProfileSettings();
    openProfileTabs('Settings');

    const index = 2; // Artifacts is at index 2
    const message = 'Create a small web based calculator app';

    // Helper function to send a message and verify artifact generation
    const sendMessageAndVerifyArtifact = (shouldGenerateArtifact) => {
        cy.contains('button', 'Chat').click();
        cy.get('textarea[placeholder="Type your message here..."]').type(message);
        cy.get('button[aria-label="Send Message"]').click({timeout: DEFAULT_TIMEOUT});

        if (shouldGenerateArtifact) {
            cy.contains('Generating artifact', { timeout: DEFAULT_TIMEOUT }).should('be.visible');
        } else {
            cy.contains('Generating artifact', { timeout: DEFAULT_TIMEOUT }).should('not.exist');
        }
    };

    // Toggle Artifacts ON and verify
    toggleExperimentalFeature(index, EnabledColor, DisabledColor, 'Artifacts');
    cy.contains('Artifacts').should('be.visible');
    sendMessageAndVerifyArtifact(true);

    // Toggle Artifacts OFF and verify
    navigateToProfileSettings();
    openProfileTabs('Settings');
    toggleExperimentalFeature(index, DisabledColor, EnabledColor, 'Artifacts');
    sendMessageAndVerifyArtifact(false);
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
    static ToggleExperimentalFeatures() {
        const EnabledColor = 'rgb(26, 58, 31)';
        const DisabledColor = 'rgb(30, 30, 30)';
        describe('Toggle Experimental Features Tests', () => {
            it('Verify Quest Master', () => {
                verifyQuestMasterFeature(EnabledColor, DisabledColor);
            });
            it('Verify Mementos', () => {
                verifyMementosFeature(EnabledColor, DisabledColor);
            });
            it('Verify Artifacts', () => {
                verifArtifactsFeature(EnabledColor, DisabledColor);
            });
        
        });
    }
}

export default Profile;
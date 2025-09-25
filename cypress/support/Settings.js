const DEFAULT_TIMEOUT = 10000;

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



class Settings {
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
}

export default Settings;
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

class Profile {
    static openProfileTab(tabName) {
        it(`Should open the ${tabName} tab in profile`, () => {
            openProfileTabs(tabName);
        });
    }
}

export default Profile;
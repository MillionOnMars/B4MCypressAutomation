import { login } from '../support/login.js';
import Profile from '../support/profile.js';

describe('Profile Tests', () => {
    beforeEach(() => {
        // Load existing user credentials from accounts.json
        cy.fixture('accounts.json').then((accounts) => {
            const { username, password } = accounts.existingUsers.admin;
            login(username, password);
        });
    });
    // Update User Settings
    Profile.UpdateUserSettings();
    // Revert User Settings
    Profile.RevertUserSettings();

});
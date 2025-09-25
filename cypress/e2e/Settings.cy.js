import { login } from '../support/login.js';
import Settings from '../support/Settings.js';

describe('Settings Tests', () => {
    beforeEach(() => {
        // Load existing user credentials from accounts.json
        cy.fixture('accounts.json').then((accounts) => {
            const { username, password } = accounts.existingUsers.admin;
            login(username, password);
        });
    });
    // Update User Settings
    Settings.UpdateUserSettings();
    // Revert User Settings
    Settings.RevertUserSettings();

});
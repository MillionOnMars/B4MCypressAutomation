import { login } from '../support/login.js';
import Profile from '../support/profile.js';

describe('Profile Tests', () => {
  before(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    // Clears all IndexedDB databases for the current origin
    cy.window().then(win => {
      if (win.indexedDB && win.indexedDB.databases) {
        // Modern browsers: list and delete all
        return win.indexedDB.databases().then(dbs => {
          dbs.forEach(dbInfo => {
            if (!dbInfo.name) return;
            win.indexedDB.deleteDatabase(dbInfo.name);
          });
        });
      }
    });
  });

  beforeEach(() => {
    // Load existing user credentials from accounts.json
    cy.fixture('accounts.json').then(accounts => {
      const { username, password } = accounts.existingUsers.admin;
      login(username, password);
    });
  });
  // Update User Settings
  Profile.UpdateUserSettings();
  // Revert User Settings
  Profile.RevertUserSettings();
  // Verify Profile Elements
  Profile.VerifyProfileElements();
  // Toggle Experimental Features
  Profile.ToggleExperimentalFeatures();
});

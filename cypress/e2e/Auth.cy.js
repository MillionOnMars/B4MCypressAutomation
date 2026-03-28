// Import the Auth class containing reusable authentication-related test cases
import Auth from '../support/Auth.js';

// Test suite for authentication-related functionality
describe('Auth', () => {
  beforeEach(() => {
    cy.clearAllStorage();
    cy.clearCookies();
  });

  // Test case for logging in with correct credentials
  Auth.correctCredentials();

  // Test case for attempting to log in with incorrect credentials
  Auth.incorrectCredentials();

  // Test case for verifying redirection to login when accessing a restricted page without authentication
  Auth.directNotebookAccessWithoutLogin();

  // Test case for logging out a user successfully
  Auth.userLogout();
});

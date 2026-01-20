const TIMEOUT = 30000;

// Navigate to the login page
const navigateToLoginPage = () => {
  cy.visit(Cypress.env('appUrl'));

  // Wait for page to fully load and potentially redirect
  cy.wait(2000); // Give time for any automatic redirects

  // Wait for URL to stabilize and check if we're on login page
  cy.location('pathname', { timeout: TIMEOUT }).then(pathname => {
    if (!pathname.includes('/login')) {
      // User is logged in, need to logout first
      logoutUser();
      cy.url({ timeout: TIMEOUT }).should('contain', '/login');
    } else {
      // Already on login page, just verify
      cy.url({ timeout: TIMEOUT }).should('contain', '/login');
    }
  });
};

// Authenticate a user with provided credentials
const authenticateUser = (username, password) => {
  cy.intercept('POST', '/api/password/login').as('loginRequest');

  cy.get('[id="username"]')
    .should('be.visible', { timeout: TIMEOUT })
    .type(username);
  cy.get('[type="submit"]').should('be.visible', { timeout: TIMEOUT }).click();
  cy.get('[id="password"]')
    .should('be.visible', { timeout: TIMEOUT })
    .type(password);
  cy.get('[type="submit"]').should('be.visible', { timeout: TIMEOUT }).click();

  cy.wait('@loginRequest', { timeout: TIMEOUT });
};

// Verify successful login by checking username and URL
const verifySuccessfulLogin = username => {
  cy.contains(username, { timeout: TIMEOUT }).should('exist');
  cy.url().should('contain', '/new');
};

// Verify logout by checking the welcome message and URL
const verifyLogout = () => {
  cy.contains('Bike4Mind', { timeout: TIMEOUT }).should('exist');
  cy.url().should('contain', '/login');
};

// Log out the user by interacting with the menu
export const logoutUser = () => {
  cy.intercept('GET', '/api/logout').as('logout');
  // Wait for user menu button and force click
  cy.get('[data-testid="notebook-sidenav-footer-menu-button"]', {
    timeout: TIMEOUT,
  })
    .should('be.visible')
    .click();

  // Wait for logout icon and force click
  cy.get('[data-testid="logout-btn"]', { timeout: TIMEOUT })
    .should('exist')
    .click({ force: true });

  // wait for the request to complete
  cy.wait('@logout', { timeout: TIMEOUT });
};

class Auth {
  static correctCredentials() {
    it('Should log in with correct credentials', () => {
      cy.fixture('accounts.json').then(accounts => {
        const admin = accounts.existingUsers.admin;
        navigateToLoginPage();
        authenticateUser(admin.username, admin.password);
        verifySuccessfulLogin(admin.name);
      });
    });
  }

  static incorrectCredentials() {
    it('Should not log in with incorrect credentials', () => {
      navigateToLoginPage();
      authenticateUser('Test', 'IncorrectPassword.');
      cy.contains('Invalid username or password', { timeout: TIMEOUT }).should(
        'exist'
      );
      cy.url().should('contain', '/login');
    });
  }

  static directNotebookAccessWithoutLogin() {
    it('Should redirect to login when accessing notebook without authentication', () => {
      cy.clearAllStorage();
      cy.visit(`${Cypress.env('appUrl')}notebooks/67e0b7c5995108235f62b359`);
      verifyLogout();
    });
  }

  static userLogout() {
    it('Should log out a user successfully', () => {
      cy.fixture('accounts.json').then(accounts => {
        navigateToLoginPage();
        const shareUser = accounts.existingUsers['auto-share'];
        authenticateUser(shareUser.username, shareUser.password);
        cy.handleWhatsNewModal();
        cy.handleTestModal();
        verifySuccessfulLogin(shareUser.name);
        logoutUser();
        verifyLogout();
      });
    });
  }
}

export default Auth;

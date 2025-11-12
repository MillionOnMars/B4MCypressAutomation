const TIMEOUT = 30000;

// Navigate to the login page
const navigateToLoginPage = () => {
    cy.visit(Cypress.env('appUrl'));
    cy.url({ timeout: TIMEOUT }).should('contain', '/login');
};

// Authenticate a user with provided credentials
const authenticateUser = (username, password) => {
    cy.get('[id="username"]', { timeout: TIMEOUT }).type(username);
    cy.get('[type="submit"]', { timeout: TIMEOUT }).click();
    cy.get('[id="password"]', { timeout: TIMEOUT }).type(password);
    cy.get('[type="submit"]', { timeout: TIMEOUT }).click();
};

// Verify successful login by checking username and URL
const verifySuccessfulLogin = (username) => {
    cy.contains(username, { timeout: TIMEOUT }).should('exist');
    cy.finalCheck().url().should('contain', '/new');
};

// Verify logout by checking the welcome message and URL
const verifyLogout = () => {
    cy.contains('Bike4Mind', { timeout: TIMEOUT }).should('exist');
    cy.finalCheck().url().should('contain', '/login');
};

// Log out the user by interacting with the menu
const logoutUser = () => {
    // Wait for user menu button and force click
    cy.get('[data-testid="notebook-sidenav-footer-menu-button"]', { timeout: TIMEOUT })
        .should('exist')
        .click();

    // Wait for logout icon and force click
    cy.get('[data-testid="LogoutIcon"]')
        .should('exist')
        .click({ force: true });
};

class Auth {
    static correctCredentials() {
        it('Should log in with correct credentials', () => {
            cy.fixture('accounts.json').then((accounts) => {
                const admin = accounts.existingUsers.admin;
                navigateToLoginPage();
                authenticateUser(admin.username, admin.password);
                verifySuccessfulLogin(admin.username);
            });
        });
    }

    static incorrectCredentials() {
        it('Should not log in with incorrect credentials', () => {
            navigateToLoginPage();
            authenticateUser('Test', 'IncorrectPassword.');
            cy.contains('Invalid username or password', { timeout: TIMEOUT }).should('exist');
            cy.finalCheck().url().should('contain', '/login');
        });
    }

    static directNotebookAccessWithoutLogin() {
        it('Should redirect to login when accessing notebook without authentication', () => {
            cy.visit(`${Cypress.env('appUrl')}notebooks/67e0b7c5995108235f62b359`);
            verifyLogout();
        });
    }

    static userLogout() {
        it('Should log out a user successfully', () => {
            cy.fixture('accounts.json').then((accounts) => {
                const shareUser = accounts.existingUsers['auto-share'];
                navigateToLoginPage();
                authenticateUser(shareUser.username, shareUser.password);
                verifySuccessfulLogin(shareUser.username);
                logoutUser();
                verifyLogout();
            });
        });
    }
}

export default Auth;

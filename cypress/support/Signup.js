
let testUser,adminUser;

before(() => {
    cy.fixture('accounts.json').then((accounts) => {
         testUser = {
           ...accounts.newUsers.user1,
           email: `${Math.random().toString(36).substring(2, 8)}_test@example.com`,
         };
         adminUser = accounts.existingUsers.admin;
    });
});

const verifyPage = (page) => {
    // Verify we're on the signup page and it loads correctly
    cy.url().should('include', `${Cypress.env('appUrl')}${page}`);
    cy.request({
        url: `${Cypress.env('appUrl')}${page}`,
        failOnStatusCode: true
    }).then((response) => {
        expect(response.status).to.eq(200);
        if (response.status === 200) {
            // Fill in the signup form
            // ...existing code...
        } else {
            cy.log(`Registration page failed to load. Status: ${response.status}`);
            throw new Error(`Registration page failed to load with status: ${response.status}`);
        }
    });
}
const signUpUser = () => {
    const account = testUser;
    cy.log(`Signing up user: ${account.username}`);

    // Visit the home page
    cy.visit(Cypress.env('appUrl'))

    // Click on the signup button
    cy.get('[data-testid="signup-text"]', { timeout: 10000 }).should('be.visible').click();

    cy.wait(2000); // Wait for 2 seconds to ensure the page loads

    // Verify we're on the signup page
    verifyPage('register'); 

    // Fill in the signup form
    cy.get('#username').should('be.visible').type(account.username);
    cy.get('.MuiInput-root > #email').should('be.visible').type(account.email);
    cy.get('#password').should('be.visible').type(account.password);
    cy.get('#confirmPassword').should('be.visible').type(account.password);
    cy.get('.MuiInput-root > #fullName').should('be.visible').type(account.fullname);
    cy.get('#inviteCode').should('be.visible').type(account.code);

    // Submit the form
    cy.get('	.MuiButton-fullWidth').should('be.visible').click();

    // Verify successful signup
    cy.contains(account.fullname+' (Personal)').should('be.visible');
    cy.finalCheck().contains('How to work with Bike4Mind?').should('be.visible');
};

const signUpWithInvalidEmail = () => {
    const account = testUser;
    const invalidEmail = 'bike4mind-email.com'; // Set invalid email format

    // Visit the home page
    cy.visit(Cypress.env('appUrl'))

    // Click on the signup button
    cy.get('[data-testid="signup-text"]', { timeout: 10000 }).should('be.visible').click();

    cy.wait(2000); // Wait for 2 seconds to ensure the page loads

    // Verify we're on the signup page
    verifyPage('register'); 

    // Fill in the signup form with invalid email
    cy.get('#username').should('be.visible').type(account.username);
    cy.get('.MuiInput-root > #email').should('be.visible').type(invalidEmail);

    // Verify error message
    cy.finalCheck().contains('Invalid email format').should('be.visible');
};

const signUpWithMismatchedPasswords = () => {
    const account = testUser;
    const mismatchedPassword = 'DifferentPassword123!';

    // Visit the home page
    cy.visit(Cypress.env('appUrl'))

    // Click on the signup button
    cy.get('[data-testid="signup-text"]', { timeout: 10000 }).should('be.visible').click();

    // Verify we're on the signup page
    verifyPage('register'); 

    // Fill in the signup form with mismatched passwords
    cy.get('#username').should('be.visible').type(account.username);
    cy.get('.MuiInput-root > #email').should('be.visible').type(account.email);
    cy.get('#password').should('be.visible').type(account.password);
    cy.get('#confirmPassword').should('be.visible').type(mismatchedPassword);

    // Verify error message
    cy.finalCheck().contains("Passwords don't match").should('be.visible');
};

const signUpWithLess8CharPass = () => {
    const account = testUser;
    const less8Char = '12345!';

    // Visit the home page
    cy.visit(Cypress.env('appUrl'))

    // Click on the signup button
    cy.get('[data-testid="signup-text"]', { timeout: 10000 }).should('be.visible').click();

    // Verify we're on the signup page
    verifyPage('register'); 

    // Fill in the signup form with mismatched passwords
    cy.get('#username').should('be.visible').type(account.username);
    cy.get('.MuiInput-root > #email').should('be.visible').type(account.email);
    cy.get('#password').should('be.visible').type(less8Char);

    // Verify error message
    cy.finalCheck().contains("Password must be at least 8 characters").should('be.visible');
};

class Signup {
    static SignUpUser() {
        // TODO: Bypass invite codes in staging for cypress tests
        xit('Should sign up user.', () => {
            signUpUser();
        });
    }
    static SignUpWithInvalidEmail() {
        it('Should show error for invalid email format', () => {
            signUpWithInvalidEmail();
        });
    }
    static SignUpWithMismatchedPasswords() {
        it('Should show error for mismatched passwords', () => {
            signUpWithMismatchedPasswords();
        });
    }
    static SignUpWithLess8CharPassword() {
        it('Should show error for less 8 char passwords', () => {
            signUpWithLess8CharPass();
        });
    }
}

export default Signup;
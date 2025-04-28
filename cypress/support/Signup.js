const signupuser = (username, email, password) => {
    // Visit the signup page
    cy.visit('/signup');

    // Fill in the signup form
    cy.get('[data-cy="signup-username"]').should('be.visible').type(username);
    cy.get('[data-cy="signup-email"]').should('be.visible').type(email);
    cy.get('[data-cy="signup-password"]').should('be.visible').type(password);
    cy.get('[data-cy="signup-confirm-password"]').should('be.visible').type(password);

    // Submit the form
    cy.get('[data-cy="signup-submit"]').should('be.visible').click();

    // Verify successful signup
    cy.contains('Welcome, ' + username).should('be.visible');
};

class Signup {
    static SignUpUser() {
        it('Should sign up a user.', () => {
            signupuser(username); // Pass the notebookName argument
        });
    }
}
export default Signup;
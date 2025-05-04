import Signup from '../support/Signup';

describe('Signup Tests', () => {
    // Test invalid email format
    Signup.SignUpWithInvalidEmail();

    // Test mismatched passwords
    Signup.SignUpWithMismatchedPasswords();

    // Less than 8 characters password
    Signup.SignUpWithLess8CharPassword();
    
    // Test case for signing up a user
    Signup.SignUpUser();
});
import Subscription from '../support/subscription';
import  { login }  from '../support/login.js';

describe('Subscription Operations', () => {
    // Log in to the application before running the tests
    beforeEach(() => {
        // Load existing user credentials from accounts.json
        cy.fixture('accounts.json').then((accounts) => {
            const { username, password } = accounts.existingUsers.admin;
            login(username, password);
        });
    });
    
    // Navigate to subscription page and subscribe
    Subscription.navigateToSubscription();
});
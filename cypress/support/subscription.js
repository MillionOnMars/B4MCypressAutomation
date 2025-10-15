import { openProfileTabs } from "./profile.js";

const DEFAULT_TIMEOUT = 60000;

const navigateToSubscription = () => {
    // Go to Profile Settings
    openProfileTabs('Profile');

    // Check if subscription is none
    cy.get('.profile-detail-tab-subscription-value', { timeout: DEFAULT_TIMEOUT })
        .contains('None', { matchCase: false })
        .should('be.visible')

    // Click on Manage subscription settings
    cy.get("[aria-label='Manage Subscription']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    
    //click on subscribe button
    cy.get('.subscription-action-button', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    cy.get('#cardNumber', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');

    // // Verify URL routes to Stripe checkout page
    // cy.url({ timeout: DEFAULT_TIMEOUT })
    //     .should('include', 'https://checkout.stripe.com/');
};

const stripeTestCardDetails = () => {
    // If Stripe checkout is in an iframe
    // cy.get('iframe[src*="stripe.com"]')
    cy.origin('https://checkout.stripe.com', () => {
        // Verify we're on Stripe checkout page
        cy.url().should('include', 'checkout.stripe.com');
        
        // Fill in payment details
        cy.get('input[name="cardnumber"]', { timeout: 30000 })
            .should('be.visible')
            .type('4242424242424242'); // Test card number
        
        cy.get('input[name="exp-date"]')
            .should('be.visible')
            .type('1225'); // MM/YY format
        
        cy.get('input[name="cvc"]')
            .should('be.visible')
            .type('123');
        
        cy.get('input[name="postal"]')
            .should('be.visible')
            .type('12345');
        
        // Fill in email if required
        cy.get('input[type="email"]').then(($email) => {
            if ($email.length > 0) {
                cy.wrap($email).type('test@example.com');
            }
        });
        
        // Submit the payment
        cy.get('button[type="submit"]')
            .should('be.visible')
            .click();
    });
}

class Subscription {
    static navigateToSubscription = () => {
        describe('Navigate to Subscription Page', () => {
            it('Should navigate to the subscription page and subscribe successfully', () => {
                navigateToSubscription();
            });
        });
    }
}

export default Subscription;

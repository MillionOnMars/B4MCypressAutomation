import { login } from '../support/login.js';

describe('Login', () => {
    it('Try Correct Username And Password', () => {
        login('wescarda', 'Password12345!');
        cy.contains('wescarda!').should('exist');
        cy.url().should('contain', '/new');
    })
    it('Try Incorrect Username And Password', () => {
        cy.visit('https://app.bike4mind.com/login');
        cy.get('[id="username"]').type('Test')
        cy.get('[id="password"]').type('IncorrectPassword.');
        cy.get('[type="submit"]').click();
        cy.contains('Invalid username or password').should('exist');
        cy.url().should('contain', '/login');
    })
    it('Try Directly go to notebook url without login', () => {
        cy.visit('https://app.bike4mind.com/notebooks/67e0b7c5995108235f62b359');
        cy.contains('Welcome to Bike4Mind').should('exist');
        cy.url().should('contain', '/login');
    })
})

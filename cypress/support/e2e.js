// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import 'cypress-real-events/support';
import './commands';
import Notebook from './Notebook.js';
import Signup from './Signup.js';
import Projects from './Projects.js';
import Login from './login.js'; 
import Auth from './Auth.js';

// Capture console errors
Cypress.on('window:console', (msg) => {
  if (msg.type === 'error') {
    cy.log(`Console Error: ${msg.message}`);
  }
});

beforeEach(() => {
  cy.window().then((win) => {
    cy.spy(win.console, 'error').as('consoleError');
  });
});

afterEach(() => {
  cy.get('@consoleError').then((spy) => {
    const errors = spy.getCalls().map(call => call.args[0]);
    if (errors.length > 0) {
      Cypress.env('consoleErrors', errors);
    }
  });
});

export {
    Notebook,
    Signup,
    Projects,
    Login,
    Auth
};


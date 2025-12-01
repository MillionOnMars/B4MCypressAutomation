// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('verifyPageLoad', url => {
  cy.intercept('GET', '**/auth/me').as('authCheck');
  cy.visit(url, {
    timeout: 10000,
    onBeforeLoad: win => {
      win.sessionStorage.clear();
    },
  });
  cy.wait('@authCheck')
    .its('response.statusCode')
    .should('be.oneOf', [200, 401]); // Accept both authenticated and non-authenticated responses
});

/**
 * Verify answer(s) in the UI with AND/OR logic support
 * @param {string|Array} answers - Single answer string or array of answers
 * @param {Object} options - Configuration options
 * @param {string} options.logic - 'and' (default) or 'or' - how to match array answers
 * @param {string} options.selector - CSS selector to search within (default: 'body')
 * @param {number} options.timeout - Timeout in milliseconds (default: 50000)
 * @param {boolean} options.matchCase - Case sensitive matching (default: false)
 */
Cypress.Commands.add('verifyAnswers', (answers, options = {}) => {
  const {
    logic = 'and',
    selector = 'body',
    timeout = 50000,
    matchCase = false,
  } = options;

  if (Array.isArray(answers)) {
    if (logic === 'or') {
      // OR logic: at least one answer should be visible
      cy.get(selector, { timeout }).should($element => {
        const elementText = matchCase
          ? $element.text()
          : $element.text().toLowerCase();
        const found = answers.some(answer => {
          const searchText = matchCase ? answer : answer.toLowerCase();
          return elementText.includes(searchText);
        });
        expect(
          found,
          `At least one of [${answers.join(', ')}] should be visible in ${selector}`
        ).to.be.true;
      });
    } else {
      // AND logic: all answers should be visible
      answers.forEach(answer => {
        cy.get(selector, { timeout })
          .contains(answer, { timeout, matchCase })
          .should('be.visible');
      });
    }
  } else {
    // Single answer
    cy.get(selector, { timeout })
      .contains(answers, { timeout, matchCase })
      .should('be.visible');
  }
});

/**
 * Navigate to a new chat by clicking the "New Chat" button
 */
Cypress.Commands.add('navigateToNewChat', () => {
  cy.get('[data-testid="start-new-chat-btn"]', { timeout: 60000 })
    .should('be.visible')
    .click();
});

/**
 * Clear all browser storage including cookies, localStorage, and IndexedDB
 */
Cypress.Commands.add('clearAllStorage', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  // Clears all IndexedDB databases for the current origin
  cy.window().then(win => {
    if (win.indexedDB && win.indexedDB.databases) {
      // Modern browsers: list and delete all
      return win.indexedDB.databases().then(dbs => {
        dbs.forEach(dbInfo => {
          if (!dbInfo.name) return;
          win.indexedDB.deleteDatabase(dbInfo.name);
        });
      });
    }
  });
});

/**
 * Check if "What's New" modal is present and close it
 */
Cypress.Commands.add('handleWhatsNewModal', () => {
  cy.get('body', { timeout: 5000 }).then($body => {
    if (
      $body.find('button[aria-label="Close What\'s New announcements"]')
        .length > 0
    ) {
      cy.log("What's New modal found, closing it");
      cy.get('button[aria-label="Close What\'s New announcements"]', {
        timeout: 10000,
      })
        .should('be.visible')
        .click({ force: true });
      cy.wait(1000);
      cy.log("What's New modal closed successfully");
    } else {
      cy.log("What's New modal not found, continuing...");
    }
  });
});

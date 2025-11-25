import { login } from '../support/login.js';
import Projects from '../support/Projects.js';

describe('Project Operations', () => {
  before(() => {
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

  beforeEach(() => {
    // Load existing user credentials from accounts.json
    cy.fixture('accounts.json').then(accounts => {
      const { username, password } = accounts.existingUsers.admin;
      login(username, password);
    });
  });
  // Create a new project
  Projects.createProject('My New Test Project');
  // Rename the project
  Projects.renameProject('My New Test Project', 'Renamed Test Project');
  // Manage project content and members
  Projects.manageProjectContent('Renamed Test Project', {
    notebook: 'France',
    uploadFile: 'prime',
    memberEmail: 'auto-share',
    systemPrompt: 'sinigang',
    createNotebook: 'sinigang',
  });
  //validate sharing the project
  Projects.shareProject('Renamed Test Project', 'France', 'auto-share');
  // Handle system prompt operations
  Projects.systemPromptOperations('Renamed Test Project', 'sinigang');
  // Deletes the project
  Projects.deleteProject('Renamed Test Project');
});

import { login } from '../support/login.js';
import Projects from '../support/Projects.js';

describe('Project Operations', () => {
    beforeEach(() => {
        // Load existing user credentials from accounts.json
        cy.fixture('accounts.json').then((accounts) => {
            const { username, password } = accounts.existingUsers.admin;
            login(username, password);
        });
    });
        // Create a new project
        Projects.createProject('My New Project');
        // Rename the project
        Projects.renameProject('My New Project', 'Renamed Project');
        // Open project and add notebook
        Projects.openProject('Renamed Project','capital')
        // Deletes the project
        Projects.deleteProject('Renamed Project');
});
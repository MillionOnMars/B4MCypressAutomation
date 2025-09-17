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
        // Manage project content and members
        Projects.manageProjectContent('Renamed Project', {
            notebook: 'France',
            uploadFile: 'prime',
            memberEmail: 'auto-share',
            createNotebook: 'capital'
        });
        Projects.shareProject('Renamed Project','France','auto-share');
        // Deletes the project
        Projects.deleteProject('Renamed Project');
});
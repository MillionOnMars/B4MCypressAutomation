import { login } from '../support/login.js';
import Projects from '../support/Projects.js';

describe('Project Operations', () => {
    beforeEach(() => {
        // Log in to the application before running the tests
        login('wescarda', 'Password12345!');
    });
        // Create a new project
        Projects.createProject('My New Project');
        // Rename the project
        Projects.renameProject('My New Project', 'Renamed Project');
        // Deletes the project
        Projects.deleteProject('Renamed Project');
});
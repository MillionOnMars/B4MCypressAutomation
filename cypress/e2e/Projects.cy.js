import { login } from '../support/login.js';
import Projects from '../support/Projects.js';

describe('Project Operations', () => {
    before(() => {
        // Log in to the application before running the tests
        login('wescarda', 'Password12345!');
    });

    // it('should create a new project', () => {?
        // Create a new project
        Projects.createProject('My New Project2');
    // });

    // it('should rename the project', () => {
    //     // Rename the project
    //     Projects.renameProject('My New Project', 'Renamed Project');
    // });
});
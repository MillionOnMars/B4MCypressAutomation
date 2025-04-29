import { login } from '../support/login.js';
import Notebook from '../support/Notebook.js'; // Correctly import the default export

describe('Notebook Operations', () => {
    // Log in to the application before running the tests
    beforeEach(() => {login('wescarda5', 'Password12345!');});
    // Create a new notebook
    Notebook.createNotebook('list down the top 5 prime number from smallest');
    // Rename the notebook
    Notebook.renameNotebook('Renamed Notebook');
    // Deletes the notebook
    Notebook.deleteNotebook('Renamed Notebook');
});
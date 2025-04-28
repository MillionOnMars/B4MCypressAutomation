import { login } from '../support/login.js';
import Notes from '../support/Notes.js'; // Correctly import the default export

describe('Notebook Operations', () => {
    // Log in to the application before running the tests
    login('wescarda', 'Password12345!');
    // Create a new notebook
    Notes.createNotebook('My New Notebook');
    // Rename the notebook
    Notes.renameNotebook('My New Notebook', 'Renamed Notebook');
});
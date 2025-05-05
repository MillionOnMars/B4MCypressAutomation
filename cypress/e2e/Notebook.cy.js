import { login } from '../support/login.js';
import Notebook, { getRandomTextModels }  from '../support/Notebook.js'; // Correctly import the default export

describe('Notebook Operations', () => {
    const randomTextModels = getRandomTextModels(3); 
    // Log in to the application before running the tests
    
    beforeEach(() => {login('wescarda5', 'Password12345!');});
    //Choose 3 random text models and create a new notebook
    randomTextModels.forEach((model) => {
        Notebook.createNotebook('List down the top 5 prime numbers from the smallest', model);
    });
    // Rename the notebook
    Notebook.renameNotebook('Renamed Notebook');
    // Deletes the notebook
    Notebook.deleteNotebook('Renamed Notebook');
    //add a file to the notebook
    Notebook.Files('cypress/fixtures/upload/cat.png');
});
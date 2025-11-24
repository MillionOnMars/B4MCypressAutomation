import { login } from '../support/login.js';
import Notebook, { getRandomTextModels } from '../support/Notebook.js'; // Correctly import the default export
import Agents from '../support/Tools/agents.js';

describe('Notebook Operations', () => {
    const randomTextModels = getRandomTextModels(4);
    // Log in to the application before running the tests

    beforeEach(() => {
        // Load existing user credentials from accounts.json
        cy.fixture('accounts.json').then((accounts) => {
            const { username, password } = accounts.existingUsers.admin;
            login(username, password);
        });
    });
    // Choose 4 random text models and create a new notebook
    randomTextModels.forEach((model) => {
        Notebook.createNotebookWithAverage('capital', model);
    });
    // Rename the notebook
    Notebook.renameNotebook('Renamed Notebook');
    // Add tags to the notebook
    Notebook.addNotebookTags('automation');
    // Deletes the notebook
    Notebook.deleteNotebook('Renamed Notebook');
    // add a file to the notebook
    Notebook.Files('prime');
    // Manage research agent
    Notebook.manageResearchAgent({
        agentName: 'Research Agent',
        newName: 'Renamed Agent',
        description: 'This agent specializes in research tasks.',
        newDescription: 'This agent has been updated to focus on advanced research tasks.'
    });
    // Create/renamed & delete an agent
    Agents.manageAgent('Test Agent', 'Renamed Agent');
    // Validate agent prompt with random model
    const randomIndex = Math.floor(Math.random() * randomTextModels.length);
    // Validate agent prompt content
    Agents.validateAgentPrompt('Renamed Agent', 'movie', randomTextModels[randomIndex])
});

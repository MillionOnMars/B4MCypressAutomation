import { openProfileTabs } from '../profile.js';
import { selectTxtModel } from '../Notebook.js';

const DEFAULT_TIMEOUT = 60000;

let prompts;

before(() => {
    cy.fixture('prompts.json').then((promptsData) => {
       prompts = promptsData;
    });
});

const setAgentSettings = (settings, enable) => {
    cy.log(`Opening profile tab: ${settings}`);
    openProfileTabs(settings);
    //verify that button agent name exists
    cy.get('.experimental-feature-title', { timeout: DEFAULT_TIMEOUT })
        .eq(3) 
        .contains('Agents')
        .should('be.visible');
    //Enable Agents feature
    cy.get('.absolute.rounded-sm', { timeout: DEFAULT_TIMEOUT })
        .eq(3) //should be same with .experimental-feature-description
        .should('be.visible')
        .click({ force: true });
};

const validateAgentPrompt = (agentName, promptType, model) => {
    const testCase = prompts[promptType];

    // Click the "New Chat" button
    cy.xpath("//button[normalize-space()='Chat']" , { timeout: 20000 })
        .should('be.visible')
        .click();

    selectTxtModel(model);
    //Verify if models is selected
    cy.contains(model, { timeout: 20000})
        .should('be.visible');

    // Click the "Agents" button
    cy.contains('Agents', { timeout: 50000 })
        .should('be.visible')
        .click();

    // Enable the agent by clicking on the agent name from the menu
    cy.contains('ul[role="menu"].MuiMenu-root',agentName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .parent() // Go to parent container
        .trigger('mouseover')
        .within(() => {
            cy.get('button.relative.rounded-md.transition-colors.duration-300')
                .eq(0)
                .should('be.visible')
                .click();
        });

    // Type the question in the textarea
    cy.xpath('//textarea[@placeholder="Type your message here..."]')
        .should('be.visible')
        .type(testCase.prompt)
        .type('{enter}');
    
    // Check if agent response is visible
    cy.contains('Agent Response:', { timeout: 50000 })
        .should('be.visible');
    //contains the agent name
    cy.contains(agentName, { timeout: 50000 }).should('be.visible');
    // Validate the answer (supports both string and array with AND/OR logic)
    cy.verifyAnswers(testCase.answer, {
        logic: testCase.answerLogic || 'or',
        selector: 'body',
        timeout: 50000,
        matchCase: false
    });
    cy.log('Agent prompt validated successfully.');
}



const handleAgentOperations = (action, agentName, newName) => {
    // Click Agents tab
    cy.get('[data-testid="notebook-sidenav-agents-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click({force: true});

    switch(action) {
        case 'create':
            // Click New Agent button
            cy.contains('button', 'Create Agent', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click({force: true});

            // Input agent name
            cy.get('input[placeholder="E.g., Research Assistant"]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .type(agentName);

            // Input description
            cy.get('textarea[placeholder="Describe what this agent does..."]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .type(agentName)
                .click();

            //click generate button to auto fill
            cy.contains('Generate Being with Purpose', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            // Click create agent button
            cy.get('.MuiButton-sizeMd')
                .contains('Create Agent', { timeout: DEFAULT_TIMEOUT })
                .scrollIntoView({ easing: 'linear', duration: 500 })
                .should('be.visible')
                .click({ force: true });

            // Verify success message
            cy.contains('Agent created successfully', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            break;

        case 'rename':     
            // Click settings button
            // cy.get('.notebook-sidenav-agents-manage-button', { timeout: DEFAULT_TIMEOUT })
            //     .should('exist')
            //     .click({force: true});

            // Find and click specific agent
            cy.contains('.MuiTypography-h4', agentName, { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click({ force: true });

            // Click edit button
            cy.contains('Edit', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click({force: true});

            // Input new agent name
            cy.get('input[placeholder="E.g., Research Assistant"]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .clear()
                .type(newName);

            // Click update agent button
            cy.contains('.MuiButton-sizeMd', 'Update Agent', { timeout: DEFAULT_TIMEOUT })
                .scrollIntoView({ easing: 'linear', duration: 500 })
                .should('be.visible')
                .click();

            // Verify success message
            cy.contains('Agent updated successfully', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            break;

        case 'delete':
            // Click settings button
            // cy.get('.notebook-sidenav-agents-manage-button', { timeout: DEFAULT_TIMEOUT })
            //     .should('exist')
            //     .click();

            // Find and click specific agent
            cy.contains('.MuiTypography-h4', agentName, { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click({ force: true });

            // Click delete button
            cy.contains('Delete', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            // Verify success message
            cy.contains('Agent deleted successfully', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            break;

        default:
            throw new Error(`Invalid action: ${action}. Use 'create', 'rename', or 'delete'`);
    }
};



class Agents {
    static manageAgent(agentName, newName = 'Renamed Agent') {
        describe(`Agent Operations for: ${agentName}`, () => {
            it('Should create new agent.', () => {
                setAgentSettings('Settings', true);
                handleAgentOperations('create', agentName);
            });
            it(`Should rename it to ${newName}.`, () => {
                setAgentSettings('Settings', true);
                handleAgentOperations('rename', agentName, newName);
            });
        });
    }
        static validateAgentPrompt(agentName, promptType, model) {
        describe(`Agent Prompt Validation for: ${agentName}`, () => {
            it(`${model}: Should validate agent prompt content.`, () => {
                setAgentSettings('Settings', true);
                validateAgentPrompt(agentName, promptType, model);
            });
            it(`Should delete ${agentName}.`, () => {
                setAgentSettings('Settings', true);
                handleAgentOperations('delete', agentName);
            });
        });
    }
}

export default Agents;
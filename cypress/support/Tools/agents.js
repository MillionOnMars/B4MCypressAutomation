import { openProfileTabs } from '../profile.js';
const DEFAULT_TIMEOUT = 60000;


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


const handleAgentOperations = (action, agentName, newName) => {
    // Click Agents tab
    cy.get('[aria-label="Agents"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    switch(action) {
        case 'create':
            // Click New Agent button
            cy.contains('button', 'New Agent', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

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
            cy.get('.notebook-sidenav-agents-manage-button', { timeout: DEFAULT_TIMEOUT })
                .should('exist')
                .click();

            // Find and click specific agent
            cy.contains('.MuiTypography-h4', agentName, { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click({ force: true });

            // Click edit button
            cy.contains('Edit', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

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
            cy.get('.notebook-sidenav-agents-manage-button', { timeout: DEFAULT_TIMEOUT })
                .should('exist')
                .click();

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
            it(`Should delete ${newName}.`, () => {
                setAgentSettings('Settings', true);
                handleAgentOperations('delete', newName);
            });
        });
    }
}

export default Agents;
const DEFAULT_TIMEOUT = 30000;

const handleAgentOperations = (action, agentName, newName = '') => {
    // Click Agents tab
    cy.get('[aria-label="Agents"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    switch(action) {
        case 'create':
            // Click Create Agent button
            cy.contains('button', 'Create Agent')
                .should('be.visible')
                .click();

            // Fill agent name
            cy.get('[data-testid="agent-name-input"]')
                .should('be.visible')
                .type(agentName);

            // Click Create button
            cy.get('[data-testid="create-agent-button"]')
                .should('be.visible')
                .click();

            // Verify success message
            cy.contains('Agent created successfully')
                .should('be.visible');
            break;

        case 'edit':
            // Find and click edit button for specific agent
            cy.contains(agentName)
                .parent()
                .find('[data-testid="edit-agent-button"]')
                .should('be.visible')
                .click();

            // Edit agent details
            cy.get('[data-testid="agent-description"]')
                .clear()
                .type('Updated description');

            // Save changes
            cy.get('[data-testid="save-agent-button"]')
                .should('be.visible')
                .click();

            // Verify success message
            cy.contains('Agent updated successfully')
                .should('be.visible');
            break;

        case 'rename':
            // Find and click rename button
            cy.contains(agentName)
                .parent()
                .find('[data-testid="rename-agent-button"]')
                .should('be.visible')
                .click();

            // Enter new name
            cy.get('[data-testid="agent-name-input"]')
                .clear()
                .type(newName);

            // Save new name
            cy.get('[data-testid="save-name-button"]')
                .should('be.visible')
                .click();

            // Verify success message
            cy.contains('Agent renamed successfully')
                .should('be.visible');
            break;

        case 'delete':
            // Find and click delete button
            cy.contains(agentName)
                .parent()
                .find('[data-testid="delete-agent-button"]')
                .should('be.visible')
                .click();

            // Confirm deletion
            cy.get('[data-testid="confirm-delete-button"]')
                .should('be.visible')
                .click();

            // Verify success message
            cy.contains('Agent deleted successfully')
                .should('be.visible');
            break;

        default:
            throw new Error(`Invalid action: ${action}. Use 'create', 'edit', 'rename', or 'delete'`);
    }
};

class Agents {
    static manageAgent(agentName, newName = '') {
        describe(`Agent Operations for: ${agentName}`, () => {
            it('Should create new agent', () => {
                handleAgentOperations('create', agentName);
            });

            it('Should edit agent details', () => {
                handleAgentOperations('edit', agentName);
            });

            if (newName) {
                it(`Should rename agent to: ${newName}`, () => {
                    handleAgentOperations('rename', agentName, newName);
                });
            }

            it('Should delete agent', () => {
                handleAgentOperations('delete', newName || agentName);
            });
        });
    }
}

export default Agents;
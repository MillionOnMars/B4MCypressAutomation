const DEFAULT_TIMEOUT = 10000;

const createProject = (projectName) => {
    // Click the "Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Click the "New Project" button
    cy.get('.MuiBox-root.css-1t228ch > button', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get(".MuiInput-formControl.css-1kti2wz", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .type(projectName);

    // Type the project description in the input field
    cy.get(`.MuiTextarea-formControl.css-96akkw`, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .type(projectName);

    // Click the "Create Project" button
    cy.get('.MuiButton-sizeMd.css-dvzipw', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project is created
    cy.contains('Project created successfully', { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('exist');
};

const renameProject = (oldName, newName) => {
    // Click the "Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Checks if the new project created exists
    cy.contains(oldName, { timeout: DEFAULT_TIMEOUT })
        .should('exist')

    //Clicks ellipsis button
    cy.get('.MuiBox-root.css-6su6fj > button', { timeout: DEFAULT_TIMEOUT })
        .eq(0)
        .should('be.visible')
        .click();

    //Clicks Edit button
    cy.get('.MuiMenuItem-variantPlain', { timeout: DEFAULT_TIMEOUT })
        .eq(0)
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get(".MuiInput-formControl.css-1kti2wz", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .clear()
        .type(newName);

    // Click the "Update Project" button
    cy.get('.MuiButton-sizeMd.css-dvzipw', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project is updated
    cy.contains('Project updated successfully', { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.contains(newName, { timeout: DEFAULT_TIMEOUT }).should('exist');
};

const deleteProject = (projectName) => {
    // Click the "Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project exists
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('exist');

    //Clicks ellipsis button
    cy.get('.MuiBox-root.css-6su6fj > button', { timeout: DEFAULT_TIMEOUT })
        .eq(0)
        .should('be.visible')
        .click();

    //Clicks Delete button
    cy.get('.MuiMenuItem-variantPlain', { timeout: DEFAULT_TIMEOUT })
        .eq(1)
        .should('be.visible')
        .click();

    // Confirm the deletion in the confirmation dialog
    cy.get('.MuiButton-sizeMd.css-25d5g8', { timeout: DEFAULT_TIMEOUT })
        .contains('Delete')
        .should('be.visible')
        .click();

    // Verify the project is deleted
    cy.contains('Project deleted successfully', { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('not.exist');
};

const addMemberToProject = (member) => {
    // Click the "Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
        
    // Verify the project exists
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('exist');

    //Click Project
    cy.get('.css-1t1ye16', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Click the Memebers Tab
    cy.get("button[id=':rn:']", { timeout: DEFAULT_TIMEOUT })
        .contains('Member')
        .should('be.visible')
        .click();

    // Click the "Add Member" button
    cy.get("button[class='MuiButton-root MuiButton-variantSolid MuiButton-colorPrimary MuiButton-sizeMd css-z050ox']", { timeout: DEFAULT_TIMEOUT })
        .contains('Add Member')
        .should('be.visible')
        .click();

    // Type the member's name in the input field
    cy.get("input[placeholder='Search users']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .type(member)

    // Click the member's checkbox from the dropdown
    cy.get("input[id=':r3q:']", { timeout: DEFAULT_TIMEOUT })
        .first()
        .should('be.visible')
        .check();

    // Click the "Add" button
    cy.get("button[class='MuiButton-root MuiButton-variantSolid MuiButton-colorPrimary MuiButton-sizeMd css-h8cd5x']", { timeout: DEFAULT_TIMEOUT })
        .contains('Add')
        .should('be.visible')
        .click();

    // Verify the member is added
    cy.contains('Sent an invite to the selected users', { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.contains(`${member}`, { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.contains('Pending', { timeout: DEFAULT_TIMEOUT }).should('exist');



};

class Projects {
    static createProject(projectName) {
        it('Should create a new project', () => {
            createProject(projectName);
        });
    }

    static renameProject(oldName, newName) {
        it('Should rename a project', () => {
            renameProject(oldName, newName);
        });
    }

    static deleteProject(projectName) {
        it('Should delete a project', () => {
            deleteProject(projectName);
        });
    }
}

export default Projects;
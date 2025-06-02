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

const openProject = (projectName) => {
    // Click the "Project" button
    cy.xpath(' //button[normalize-space()="Projects"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project list is visible
    cy.contains ('Updated', { timeout: DEFAULT_TIMEOUT }).should('be.visible')

    // Find and click on the specific project
    cy.xpath(`//div[contains(text(),${projectName})]`, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .first()  // Ensure we only get the first match
        .click();

    // Verify project is opened
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('be.visible');
};

const addNotebook = (notebookName) => {
    // Open the project first
    openProject(projectName);

    // Wait for notebooks to load
    cy.wait(1000);

    // Find and click on the specific notebook
    cy.contains(`${notebookName}']`,
        { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    //Click Add Item
    cy.xpath('//button[normalize-space()="Add 1 items"]')
        .should('be.visible')
        .click();

        // Find and click on the specific notebook
    cy.contains(`${notebookName}']`,
        { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
};

const removeNotebook = (notebookName) => {
    // Open the project first
    openProject(projectName);

    // Wait for notebooks to load
    cy.wait(1000);

    // Find the notebook and click its menu
    cy.xpath(`//div[contains(text(),${notebookName})]`, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Click Remove button from dropdown
    cy.get('.MuiBox-root.css-i5q2k0 > button')
        .eq(4)
        .should('be.visible')
        .click();

    // Confirm removal in dialog
    cy.get('.MuiButton-sizeMd')
        .contains('Remove')
        .should('be.visible')
        .click();

    // Verify notebook is removed
    cy.contains('Notebook removed successfully', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
    cy.contains(notebookName, { timeout: DEFAULT_TIMEOUT })
        .should('not.exist');
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
    static openProject(projectName) {
        it(`Should open project: ${projectName}`, () => {
            openProject(projectName);
        });
    }
}

export default Projects;
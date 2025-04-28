const createProject = (projectName) => {
    // Click the "Create Project" button
    cy.get('.MuiButton-root.MuiButton-variantSolid.MuiButton-colorPrimary')
        .eq(0)
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get('.MuiTextarea-root')
        .should('be.visible')
        .type(projectName);

    // Click the "Enter" button
    cy.get('.MuiButton-sizeMd.css-8yhwlq')
        .should('be.visible')
        .click();

    // Verify the project is created
    cy.contains('span', projectName).should('be.visible');
    cy.log('Project creation completed successfully');
};

const renameProject = (oldName, newName) => {
    // Locate the project by its current name
    cy.contains('span', oldName)
        .should('be.visible')
        .click();

    // Click the "More Options" button
    cy.get('[data-testid="MoreVertIcon"]')
        .should('be.visible')
        .click();

    // Click the "Rename" button
    cy.get('[data-cy="rename-project-button"]')
        .should('be.visible')
        .click();

    // Type the new project name
    cy.get('[data-cy="project-name-input"]')
        .should('be.visible')
        .clear()
        .type(newName);

    // Save the new name
    cy.get('[data-cy="save-project-button"]')
        .should('be.visible')
        .click();

    // Verify the project name has been updated
    cy.contains('span', newName).should('be.visible');
    cy.log('Project renamed successfully');
};

class Projects {
    static createProject(projectName) {
        it('should create a new project', () => {
            createProject(projectName);
        });
    }

    static renameProject(oldName, newName) {
        it('should rename a project', () => {
            renameProject(oldName, newName);
        });
    }
}

export default Projects;
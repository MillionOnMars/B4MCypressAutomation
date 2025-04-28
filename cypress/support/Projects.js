const createProject = (projectName) => {
    // Click the "Create Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)')
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get('.MuiBox-root.css-1t228ch > button')
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get(".MuiInput-formControl.css-1kti2wz")
        .should('be.visible')
        .type(projectName);

    // Type the project description in the input field
    cy.get(`.MuiTextarea-formControl.css-96akkw`)
    .should('be.visible')
    .type(projectName);

    // Click the "Create Project" button
    cy.get('.MuiButton-sizeMd.css-dvzipw')
        .should('be.visible')
        .click();
};

const renameProject = (oldName, newName) => {
    // Locate the project by its current name
    cy.get('.project-menu.MuiBox-root.css-6su6fj > button > svg')
        .eq(0)
        .should('be.visible')
        .click();

    // Click the "More Options" button
    cy.get('.MuiBox-root css-ankh81')
        .should('be.visible')
        .click();

    // // Click the "Rename" button
    // cy.get('[data-cy="rename-project-button"]')
    //     .should('be.visible')
    //     .click();

    // // Type the new project name
    // cy.get('[data-cy="project-name-input"]')
    //     .should('be.visible')
    //     .clear()
    //     .type(newName);

    // // Save the new name
    // cy.get('[data-cy="save-project-button"]')
    //     .should('be.visible')
    //     .click();

    // // Verify the project name has been updated
    // cy.contains('span', newName).should('be.visible');
    // cy.log('Project renamed successfully');
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
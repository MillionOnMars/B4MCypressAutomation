const createProject = (projectName) => {
    // Click the "Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)')
        .should('be.visible')
        .click();

    // Click the "New Project" button
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
    cy.wait(3000)

    // Verify the project is created
    cy.contains('Project created successfully').should('exist');
    cy.contains(projectName).should('exist');
};

const renameProject = (oldName, newName) => {
    // Click the "Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)')
        .should('be.visible')
        .click();

    // Checks if he new project created exist.
    cy.contains(oldName).should('exist')
    .click();

    //Clicks elipsis button
    cy.get('.MuiBox-root.css-6su6fj > button').eq(0)
        .should('be.visible')
        .click();

    //Clicks Edit button.
    cy.get('.MuiMenuItem-variantPlain').eq(0)
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get(".MuiInput-formControl.css-1kti2wz")
        .should('be.visible')
        .clear()
        .type(newName);

    // Click the "Create Project" button
    cy.get('.MuiButton-sizeMd.css-dvzipw')
        .should('be.visible')
        .click();
    cy.wait(3000)

    // Verify the project is created
    cy.contains('Project updated successfully').should('exist');
    cy.contains(newName).should('exist');
};

const deleteProject = (projectName) => {
    // Click the "Project" button
    cy.get('.MuiBox-root.css-ppif72 > button:nth-child(2)')
        .should('be.visible')
        .click();

    // Verify the project exists
    cy.contains(projectName).should('exist');

    //Clicks elipsis button
    cy.get('.MuiBox-root.css-6su6fj > button').eq(0)
        .should('be.visible')
        .click();

    //Clicks Delete button.
    cy.get('.MuiMenuItem-variantPlain').eq(1)
        .should('be.visible')
        .click();

    // Confirm the deletion in the confirmation dialog
    cy.get('.MuiButton-sizeMd.css-25d5g8').contains('Delete')
        .should('be.visible')
        .click();
    cy.wait(3000)

    // Verify the project is deleted
    cy.contains('Project deleted successfully').should('exist');
    cy.contains(projectName).should('not.exist');
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
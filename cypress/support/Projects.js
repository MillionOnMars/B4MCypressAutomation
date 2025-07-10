const DEFAULT_TIMEOUT = 10000;

const createProject = (projectName) => {
    // Click the "Project" button
    cy.xpath('//button[normalize-space()="Projects"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Click the "New Project" button
    cy.xpath('//button[normalize-space()="New Project"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get("input[id*=':r']", { timeout: DEFAULT_TIMEOUT }).eq(1)
        .should('be.visible')
        .type(projectName);

    // Type the project description in the input field
    cy.get(`textarea[id*=':r']`, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .type(projectName);

    // Click the "Create Project" button
    cy.get('button[type="submit"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project is created
    cy.contains('Project created successfully', { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('exist');
};

const renameProject = (oldName, newName) => {
    // Click the "Project" button
    cy.xpath('//button[normalize-space()="Projects"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Checks if the new project created exists
    cy.contains(oldName, { timeout: DEFAULT_TIMEOUT })
        .should('exist')

    //Clicks ellipsis button
    cy.get('.lucide.lucide-more-vertical', { timeout: DEFAULT_TIMEOUT })
        .eq(0)
        .should('be.visible')
        .click();

    //Clicks Edit button
    cy.get('.MuiMenuItem-variantPlain', { timeout: DEFAULT_TIMEOUT })
        .eq(0)
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get("input[id*=':r']", { timeout: DEFAULT_TIMEOUT }).eq(1)
        .should('be.visible')
        .clear()
        .type(newName);

    // Click the "Update Project" button
    cy.xpath('//button[normalize-space()="Update Project"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project is updated
    cy.contains('Project updated successfully', { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.contains(newName, { timeout: DEFAULT_TIMEOUT }).should('exist');
};

const deleteProject = (projectName) => {
    // Click the "Project" button
    cy.xpath('//button[normalize-space()="Projects"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project exists
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('exist');

    //Clicks ellipsis button
    cy.get('.lucide.lucide-more-vertical', { timeout: DEFAULT_TIMEOUT })
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
}

export default Projects;
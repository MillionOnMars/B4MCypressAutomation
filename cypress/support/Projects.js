const DEFAULT_TIMEOUT = 10000;

let prompts;

before(() => {
    cy.fixture('prompts.json').then((promptsData) => {
        prompts = promptsData;
    });
});

const openProject = (projectName) => {
    // Click the "Project" button
    cy.xpath(' //button[normalize-space()="Projects"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project list is visible
    cy.contains ('Updated', { timeout: DEFAULT_TIMEOUT }).should('be.visible')

    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
}

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

const addNotebook = (notebookName,projectName) => {
    openProject(projectName);

    //Click Add Notebooks button
    cy.xpath("//button[normalize-space()='Add Notebooks']")
        .should('be.visible')
        .click();

    // Select the notebook by its name
    cy.get('.css-1jj0cvj', { timeout: DEFAULT_TIMEOUT }).eq(0)
        .click({ force: true });

    // Click the "Add 1 items" button
    cy.xpath("//button[normalize-space()='Add 1 items']")
        .should('be.visible')
        .click();

    // Verify sessions added message
    cy.contains('Sessions added to project successfully', { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible');
    
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

const uploadFileWithFileBrowser = (promptType,projectName) => {
    openProject(projectName);
    const testCase = prompts[promptType];
    const filename = testCase.filepath.split("/").pop();
    //Click Project Files Tab
    cy.xpath("//div[@class='MuiBox-root css-17busxr'][normalize-space()='Project Files (0)']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Find the File Browser section
    cy.xpath("//p[normalize-space()='File Browser']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
 
    //Checks if file is present
    cy.contains(filename)
      .should("be.visible")
      .click();

    //click add file
    cy.contains("Add 1 File").should("be.visible").click();

    // Verify file upload success message
    cy.contains('Files added to project successfully', { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible');
};

class Projects {
    static openProject(projectName,notebookName) {
        describe('Project Operations', () => {
          it("Adds notebook.", () => {
            addNotebook(notebookName,projectName);
          });
          it("Upload file", () => {
            uploadFileWithFileBrowser('prime',projectName)
          });
          it("Add members", () => {
          });
      });
    }
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
        describe('Delete Project', () => {
        it('Should delete a project', () => {
            deleteProject(projectName);
        });
      });
    }
}

export default Projects;
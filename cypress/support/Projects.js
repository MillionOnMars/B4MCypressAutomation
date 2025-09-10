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
    cy.contains('Updated', { timeout: DEFAULT_TIMEOUT }).should('be.visible')

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

const addNotebook = (notebookName, projectName) => {
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

const uploadFileWithFileBrowser = (promptType, projectName) => {
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

const createNotebook = (promptType, projectName) => {
    openProject(projectName);
    const testCase = prompts[promptType];
    let startTime;

    //Click Add Notebooks button
    cy.xpath("//button[normalize-space()='Add Notebooks']")
        .should('be.visible')
        .click();

    // Click Create Notebook
    cy.xpath("//a[normalize-space()='Create']")
        .should('be.visible')
        .click();

    // Type the question in the textarea
    cy.xpath('//textarea[@placeholder="Type your message here..."]')
        .should('be.visible')
        .type(testCase.prompt)
        .type('{enter}');

    // Wait until the notebook is created
    cy.contains('New Notebook', { timeout: 50000 })
        .should('be.visible');

    // Handle both array and string answers
    if (Array.isArray(testCase.answer)) {
        testCase.answer.forEach((answer) => {
            cy.contains(answer, { timeout: 50000 }).should('be.visible');
        });
        return 0; // Return 0 for array answers or handle differently
    } else {
        return new Cypress.Promise(resolve => {
            cy.window().then(() => { startTime = Date.now(); });

            // Wait until the question appears
            cy.contains(testCase.prompt, { timeout: 50000 })
                .should('be.visible');

            cy.get('p.MuiTypography-root')
                .contains(testCase.answer, { timeout: 50000, matchCase: false })
                .should('be.visible')
                .then(() => {
                    const duration = (Date.now() - startTime) / 1000;
                    cy.log(`It took ${duration} seconds for the answer to appear and be visible.`);
                    resolve(duration);
                });
            cy.contains('Renamed Project', { timeout: 50000 })
                .should('be.visible');
            cy.log('Notebook creation completed successfully.');

        });

    }



};

class Projects {
    static openProject(projectName, notebookName) {
        describe('Project Operations', () => {
            it("Adds notebook.", () => {
                addNotebook(notebookName, projectName);
            });
            it("Upload file", () => {
                uploadFileWithFileBrowser('prime', projectName)
            });
            it("Add members", () => {
            });
            it("Create notebook", () => {
                createNotebook(notebookName, projectName);
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
    static createNotebook(notebookName, projectName) {
        it('Should create a new notebook', () => {
            createNotebook(notebookName, projectName);
        });
    }
}

export default Projects;
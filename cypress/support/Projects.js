import { login } from '../support/login.js';

const DEFAULT_TIMEOUT = 60000;
let prompts;

before(() => {
    cy.fixture('prompts.json').then((promptsData) => {
        prompts = promptsData;
    });
});

const projectTabButtonSelector = '[data-testid="project-tab-list"] button[role="tab"]'

const openProject = (projectName) => {
    // Click the "Project" button
    cy.get('[data-testid="notebook-sidenav-projects-button"]', { timeout: DEFAULT_TIMEOUT })
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
    cy.get('[data-testid="notebook-sidenav-projects-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Click the "New Project" button
    cy.xpath('//button[normalize-space()="New Project"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get('[data-testid="create-project-form-container"] [data-testid="name-input"]', { timeout: DEFAULT_TIMEOUT }).eq(0)
        .should('be.visible')
        .type(projectName);

    // Type the project description in the input field
    cy.get('[data-testid="create-project-form-container"] [data-testid="description-textarea"]', { timeout: DEFAULT_TIMEOUT })
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
    cy.get('[data-testid="notebook-sidenav-projects-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Checks if the new project created exists
    cy.contains(oldName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
    // .trigger('mouseover')
    // .parent() // Go to parent container
    cy.get('.project-card-menu-button', { timeout: DEFAULT_TIMEOUT }).eq(0)
        .should('exist')
        .click({ force: true }); // Force click even if not visible

    //Clicks Edit button
    cy.get('.MuiMenuItem-variantPlain', { timeout: DEFAULT_TIMEOUT })
        .eq(0)
        .should('be.visible')
        .click();

    // Type the project name in the input field
    cy.get('[data-testid="project-edit-modal-form"] [data-testid="name-input"]', { timeout: DEFAULT_TIMEOUT }).eq(0)
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
    cy.get('[data-testid="notebook-sidenav-projects-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Checks if the project created exists
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
    cy.get('.project-card-menu-button', { timeout: DEFAULT_TIMEOUT }).eq(0)
        .should('exist')
        .click({ force: true }); // Force click even if not visible

    //Clicks Delete button
    cy.contains('.MuiMenuItem-variantPlain', 'delete', { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible')
        .click();

    // Confirm the deletion in the confirmation dialog
    cy.contains('button', 'delete', { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible')
        .click();

    // Verify the project is deleted
    cy.contains('Project deleted successfully', { timeout: DEFAULT_TIMEOUT }).should('exist');

    // TODO: There's a high chance that there will be a duplicate project, because we are all using the same credentials for running tests
    // cy.contains(projectName, { timeout: DEFAULT_TIMEOUT }).should('not.exist');
};

const checkAndDeleteProjectIfExists = (projectName) => {
    // Click the "Project" button to open projects list
    cy.get('[data-testid="notebook-sidenav-projects-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify the project list is visible
    cy.contains('Updated', { timeout: DEFAULT_TIMEOUT }).should('be.visible');

    // Check if the project exists
    cy.get('body', { timeout: DEFAULT_TIMEOUT }).then($body => {
        if ($body.find(`*:contains("${projectName}")`).length > 0) {
            cy.log(`Project "${projectName}" found, proceeding to delete it`);

            // Project exists, delete it
            cy.contains(projectName, { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .then(() => {
                    // Click the menu button for this project
                    cy.get('.project-card-menu-button').eq(0)
                        .should('exist')
                        .click({ force: true });

                    // Click Delete button
                    cy.contains('.MuiMenuItem-variantPlain', 'delete', { timeout: DEFAULT_TIMEOUT, matchCase: false })
                        .should('be.visible')
                        .click();

                    // Confirm the deletion in the confirmation dialog
                    cy.contains('button', 'delete', { timeout: DEFAULT_TIMEOUT, matchCase: false })
                        .should('be.visible')
                        .click();

                    // Verify the project is deleted
                    cy.contains('Project deleted successfully', { timeout: DEFAULT_TIMEOUT }).should('exist');
                    cy.log(`Project "${projectName}" successfully deleted`);
                });
        } else {
            cy.log(`Project "${projectName}" not found, continuing with test execution`);
        }
    });
};

const addNotebook = (notebookName, projectName) => {
    //open project
    openProject(projectName);

    // Click the Notebooks tab
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('Notebook')
        .should('be.visible')
        .click();

    //Click Add Notebooks button
    cy.xpath("//button[normalize-space()='Add Notebooks']")
        .should('be.visible')
        .click();

    // Select the notebook checkbox
    cy.contains('[data-testid="generic-add-items-item"]', notebookName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

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

const uploadFileWithFileBrowser = (promptType, projectName, tabType) => {
    //open project
    openProject(projectName);
    const testCase = prompts[promptType];
    const filename = testCase.filepath.split("/").pop();

    //Click appropriate tab based on tabType
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains(tabType)
        .should('be.visible')
        .click();

    // Find the File Browser section
    cy.xpath("//p[normalize-space()='File Browser']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    //type in file to upload
    cy.get('.file-browser-search-input', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .type(filename);

    //Checks if file is present
    cy.get('[data-testid="file-browser-list-item"]', { timeout: DEFAULT_TIMEOUT }).contains(filename)
        .should("be.visible")
        .click();

    //click add file
    cy.contains("Add 1 File").should("be.visible").click();

    // Verify appropriate success message based on tab type
    const successMessage = tabType === 'Project Files'
        ? 'Files added to project successfully'
        : 'System Prompts added successfully';

    cy.contains(successMessage, { timeout: DEFAULT_TIMEOUT, matchCase: false })
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
    cy.get('[data-testid="lexical-chat-input-container"]')
        .should('be.visible')
        .type(testCase.prompt)
        .type('{enter}');

    // Wait until the notebook is created
    cy.contains('Chat', { timeout: 50000 })
        .should('be.visible');

    // Handle both array and string answers

    cy.verifyAnswers(testCase.answer, {
        logic: testCase.answerLogic || 'or',
        selector: '[data-testid="ai-response"]',
        timeout: 50000,
        matchCase: false
    });
};

const clickMembersTab = (projectName) => {
    //open project
    openProject(projectName);
    // Click the Members button
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('Members')
        .should('be.visible')
        .click();

    // Verify the members modal/section is visible
    cy.xpath("//button[normalize-space()='Add Members']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');
};

const addMembers = (memberEmail) => {
    // Click Add Members button
    cy.xpath("//button[normalize-space()='Add Members']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Type member email in the input field
    cy.get('input[placeholder ="Search users"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .type(memberEmail);

    // Select the member's checkbox
    cy.contains('[data-testid="generic-add-items-item"]', memberEmail, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Click the "Add 1 members" button (BUG: Should be members not items)
    cy.xpath("//button[normalize-space()='Add 1 items']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify member added message
    cy.contains('Sent an invite to the selected users', { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible');
};

const clickSystemPromptsTab = (projectName) => {
    //open project
    openProject(projectName);

    // Click the System Prompt tab
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('System Prompts')
        .should('be.visible')
        .click();

    // Find the File Browser section
    cy.xpath("//p[normalize-space()='File Browser']", { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
};

const handleSystemPrompt = (projectName, action, promptName) => {
    //open project
    openProject(projectName);

    // Click the System Prompt tab
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('System Prompts')
        .should('be.visible')
        .click();

    switch (action) {
        case 'view':
            // Click View option
            cy.get('.project-system-prompt-item-view-button', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            // verify file name is visible
            cy.contains(promptName, { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');

            // click Close button
            cy.get('.MuiModalClose-sizeMd', { timeout: DEFAULT_TIMEOUT })
                .eq(1)
                .should('exist')
                .click({ force: true });
            break;

        case 'delete':
            // Click Delete option
            cy.get('.project-system-prompt-item-menu-button', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            cy.get('.project-system-prompt-item-menu-item', { timeout: DEFAULT_TIMEOUT })
                .contains('Delete', { matchCase: false })
                .should('be.visible')
                .click();

            // Confirm deletion
            cy.get('.confirmation-modal-confirm-button')
                .should('be.visible')
                .click();

            // Verify deletion message
            cy.contains('System prompt removed successfully', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            break;

        case 'edit':
            // Click Edit option
            cy.get('.project-system-prompt-item-menu-item', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            // Verify prompt content is visible
            cy.get('[data-testid="system-prompt-view-modal"]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');

            // Close view modal
            cy.get('[data-testid="CloseIcon"]')
                .should('be.visible')
                .click();
            break;

        default:
            throw new Error(`Invalid action: ${action}. Use 'edit', 'delete', or 'view'`);
    }
};



const loginAs = (userKey) => {
    cy.fixture('accounts.json').then((accounts) => {
        const user = accounts.existingUsers[userKey];
        if (!user) {
            throw new Error(`User "${userKey}" not found in accounts.json`);
        }
        login(user.username, user.password);
    });
};

// Log out the user by interacting with the menu
const logoutUser = () => {
    cy.log('Logging out user...');
    cy.intercept('GET', '/api/logout').as('logout');
    // Wait for user menu button and force click
    cy.get('[data-testid="notebook-sidenav-footer-menu-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('exist')
        .click();

    // Wait for logout icon and force click
    cy.get('[data-testid="logout-btn"]')
        .should('exist')
        .click({ force: true });

    // wait for the request to complete
    cy.wait('@logout', { timeout: DEFAULT_TIMEOUT });

    // Verify logout by checking the welcome message and URL
    cy.contains('Bike4Mind', { timeout: DEFAULT_TIMEOUT }).should('exist');
    cy.url().should('contain', '/login');
};



const checkInbox = (projectName) => {
    // Click the menu button
    cy.get('[data-testid="notebook-sidenav-footer-menu-button"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Click inbox option
    cy.contains('Inbox', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
};

const handleProjectInvite = (projectName, action) => {
    // Click invites tab
    cy.contains('Invites', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Validate project invitation
    cy.contains(projectName, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();


    if (action === 'accept') {
        // Click accept button
        cy.get('[data-testid="CheckIcon"]', { timeout: DEFAULT_TIMEOUT })
            .eq(0)
            .should('be.visible')
            .click();

        // Verify success message
        cy.contains('Successfully joined the project', { timeout: DEFAULT_TIMEOUT, matchCase: false })
            .should('be.visible');

    } else {
        // Click deny button
        cy.get('[data-testid="DoDisturbIcon"]', { timeout: DEFAULT_TIMEOUT })
            .eq(0)
            .should('be.visible')
            .click();

        // Verify denial message
        cy.contains('Successfully refused the project', { timeout: DEFAULT_TIMEOUT, matchCase: false })
            .should('be.visible');
    }

    // Close the modal
    cy.get('.MuiModalClose-sizeMd', { timeout: DEFAULT_TIMEOUT })
        .should('exist')
        .click({ force: true });
};

const validateSharedProjects = (projectName, notebook, user) => {
    //open project
    openProject(projectName);

    // Click the Notebooks tab
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('Notebook')
        .should('be.visible')
        .click();

    // Verify notebook is present
    cy.contains(`${notebook}`, { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible');

    //Click Project Files Tab
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('Project Files')
        .should('be.visible')
        .click();

    // Verify notebook is present
    //BUG is found files were not found after upload.
    cy.contains('Project Files (0)', { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible');

    //Click members Tab
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('Members')
        .should('be.visible')
        .click();

    // Verify member is present
    cy.contains(`${user}`, { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible');

    //Click System prompts Tab
    cy.get(projectTabButtonSelector, { timeout: DEFAULT_TIMEOUT }).contains('System Prompts')
        .should('be.visible')
        .click()

    // Verify system prompt is present
    cy.contains('System Prompts (1)', { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('be.visible');

};


class Projects {
    static manageProjectContent(projectName, options) {
        describe(`Manage Project: ${projectName}`, () => {
            if (options.notebook) {
                it("Adds notebook", () => {
                    addNotebook(options.notebook, projectName);
                });
            }

            if (options.uploadFile) {
                it("Add file to project", () => {
                    uploadFileWithFileBrowser(options.uploadFile, projectName, 'Project Files');
                });
            }

            if (options.memberEmail) {
                it("Add members", () => {
                    clickMembersTab(projectName);
                    addMembers(options.memberEmail);
                });
            }

            if (options.systemPrompt) {
                it("Add system prompt", () => {
                    clickSystemPromptsTab(projectName);
                    uploadFileWithFileBrowser(options.systemPrompt, projectName, 'System Prompts');
                });
            }

            if (options.createNotebook) {
                it("Create notebook", () => {
                    createNotebook(options.createNotebook, projectName);
                });
            }
        });
    }


    static createProject(projectName) {
        it('Should create a new project', () => {
            // checkAndDeleteProjectIfExists('Renamed Test Project')
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

    static shareProject(projectName, notebook, user) {
        describe(`Logging in to user --${user}`, () => {
            it(`Should share project: ${projectName}`, () => {
                logoutUser();
                loginAs(user);
                checkInbox(projectName);
                handleProjectInvite(projectName, "accept");
                validateSharedProjects(projectName, notebook, user);
            });
        });
    }

    static systemPromptOperations(projectName, promptName) {
        describe(`System Prompt Operations for ${projectName}`, () => {
            it(`Should view system prompt: ${promptName}`, () => {
                handleSystemPrompt(projectName, 'view', promptName);
            });

            it(`Should delete system prompt: ${promptName}`, () => {
                handleSystemPrompt(projectName, 'delete', promptName);
            });
        });
    }
}

export default Projects;

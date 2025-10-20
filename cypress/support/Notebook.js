const prime = ['2', '3', '5', '7', '11'];
const capital = "Paris"
// ensure that these allow both image and text uploads since we ask it wat color is the cat.
const textModels = ['Claude 4.1 Opus', 'GPT-5', 'Gemini 2.5 Pro Preview','GPT-5 Nano','GPT-4o Mini','Gemini 2.5 Flash Preview','Claude 4.5 Sonnet', 'Claude 4.5 Haiku']; // Add your text models here

const DEFAULT_TIMEOUT = 60000; // 60 seconds

let prompts;

before(() => {
    cy.fixture('prompts.json').then((promptsData) => {
        prompts = promptsData;
    });
});

const getRandomTextModels = (count) => {
    return textModels.sort(() => 0.5 - Math.random()).slice(0, count);
};

const createNote = (promptType, model) => {
    const testCase = prompts[promptType];
    let startTime;

    //Verify if models is selected
    cy.contains(model, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')

    // Click the "New Chat" button
    cy.xpath("//button[normalize-space()='Chat']" , { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Type the question in the textarea
    cy.xpath('//textarea[@placeholder="Type your message here..."]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .type(testCase.prompt)
        .type('{enter}');

    // Wait until the notebook is created
    cy.contains('Chat', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');

    // Start timing and verify answer with credits tracking
    return new Cypress.Promise((resolve) => {
        startTime = Date.now();

        // Use verifyAnswers to check the response
        cy.verifyAnswers(testCase.answer, {
            logic: testCase.answerLogic || 'and',
            selector: '[data-testid="ai-response"]',
            timeout: 60000,
            matchCase: false
        }).then(() => {
            const duration = (Date.now() - startTime) / 1000;
            cy.log(`It took ${duration} seconds for the answer to appear and be visible.`);

            // Check if credits element exists, make it optional
            cy.get('body', { timeout: DEFAULT_TIMEOUT }).then($body => {
                if ($body.find('[data-testid="credits-used"]').length > 0) {
                    // Credits element exists, try to get the credits info
                    cy.get('[data-testid="credits-used"]', { timeout: DEFAULT_TIMEOUT })
                        .should('be.visible')
                        .click()
                        .then(() => {
                            cy.contains('Credits Used', { timeout: DEFAULT_TIMEOUT })
                                .should('exist')
                                .invoke('text')
                                .then((creditsText) => {
                                    const credits = creditsText?.match(/\d+/)?.[0] || null;
                                    cy.log(`Credits used: ${credits}`);
                                    resolve({ duration, credits: credits ? parseInt(credits) : null });
                                });
                        });
                } else {
                    // Credits element not found, resolve without credits
                    cy.log('Credits element not found, continuing without credits info');
                    resolve({ duration, credits: null });
                }
            });
        });
    });
};

const sendPrompt = (promptType, promptNo, model) => {
    const testCase = prompts[promptType];

    // Click the "New Chat" button
    cy.xpath("//button[normalize-space()='Chat']" , { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Send multiple prompts using recursion since Cypress commands are async
    const sendSinglePrompt = (currentPrompt) => {
        if (currentPrompt >= promptNo) {
            cy.log('All prompts completed successfully');
            return;
        }

        // Handle both single prompt and array of prompts
        const currentPromptData = testCase.queries ?
            testCase.queries[currentPrompt % testCase.queries.length] :
            testCase;

        //enter prompt
        cy.xpath('//textarea[@placeholder="Type your message here..."]', { timeout: DEFAULT_TIMEOUT })
            .should('be.visible')
            .type(currentPromptData.prompt)
            .type('{enter}')
            .wait(2000);

        if(model == 'claude-3-7-sonnet'){
            if (currentPrompt === 0) {
                cy.wait(5000); // First prompt
            } else {
                cy.wait(2000); // Subsequent prompts
            }

            // Shorter wait for subsequent operations
            cy.wait(2000);

            //scrolls down to the bottom of the chat container
            cy.get('.css-1aau1w6', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .scrollTo('bottom', { ensureScrollable: true })
                .then(($container) => {
                    $container[0].scrollTop = $container[0].scrollHeight;
                });
        }

        // Handle both array and single answer verification
        cy.verifyAnswers(currentPromptData.answer, {
            logic: currentPromptData.answerLogic || 'and',
            selector: '[data-testid="ai-response"]',
            timeout: currentPromptData.timeout || 60000,
            matchCase: false
        });

        cy.log(`Completed prompt ${currentPrompt + 1} of ${promptNo}`);
    };

    // Start sending prompts
    sendSinglePrompt(0);
};

const renameNote = (newName) => {
    // Click the notebook item in the sidebar
    cy.get('[data-testid="sidenav-item-session-button"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .should('be.visible')
        .click();

    // Force click the menu button
    cy.get('[data-testid="sidenav-item-menu-button"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .click({ force: true });

    // Click the rename menu item
    cy.get('.sidenav-item-menuitem-rename', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Find the INPUT inside the div with the testid
    cy.get('[data-testid="sidenav-item-rename-input"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .find('input')
        .clear({ force: true })
        .type(newName, { force: true })
        .type('{enter}', { force: true });

    cy.log('Notebook renamed successfully.');
};

const editNotebookInfo = (tags) => {
    // Click notebook to open/select it
    cy.get('[data-testid="sidenav-item-session-button"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .should('be.visible')
        .click();

    // Click ellipsis menu button
    cy.get('[data-testid="sidenav-item-menu-button"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .click({ force: true });

    // Click "View Info" menu item
    cy.get('.sidenav-item-menuitem-viewinfo', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Wait for the info modal/panel to be visible
    cy.get('input[placeholder="Add a tag"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .clear()
        .type(tags);
    
    // Click "Add Tag" button (avoid XPath, use data-testid or better selector)
    cy.contains('button', 'Add Tag', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Verify tag was added (removed the hardcoded "100" suffix - seems like a bug?)
    cy.contains('.session-metadata-tag', tags, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');

    // Close the info modal/panel
    cy.get('.session-metadata-close-button', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    cy.log(`Notebook tag "${tags}" added successfully.`);
};

const deleteNote = (name) => {
    // Click notebook to open/select it
    cy.get('[data-testid="sidenav-item-session-button"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .should('be.visible')
        .click();

    // Click ellipsis menu button (force click if visibility is conditional)
    cy.get('[data-testid="sidenav-item-menu-button"]', { timeout: DEFAULT_TIMEOUT })
        .first()
        .click({ force: true });

    // Click delete button using specific class instead of position
    cy.get('.sidenav-item-menuitem-delete', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    // Confirm deletion in modal
    cy.get('[data-testid="confirm-delete-modal"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .find('[data-testid="confirm-modal-confirm-btn"]')
        .should('be.visible')
        .click();

    // Verify success notification
    cy.contains('Successfully deleted session', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible');

    cy.log('Notebook deleted successfully.');
};

const selectTxtModel = (model) => {
    cy.get('[data-testid="session-bottom-container"] [data-testid="ai-settings-button"]', { timeout: DEFAULT_TIMEOUT })
        .eq(0)
        .should('be.visible')
        .click();

    //input text model
    cy.get("input[placeholder='Search models']", { timeout: DEFAULT_TIMEOUT })
        .eq(1)
        .should('exist')
        .type(model)
        .type('{enter}');

    //select text model
    cy.contains('div', model, { timeout: DEFAULT_TIMEOUT, matchCase: false })
        .should('exist')
        .click({ force: true });

    // clicks close button
    cy.get("[data-testid='CloseIcon']", { timeout: DEFAULT_TIMEOUT })
        .last()
        .should('be.visible')
        .click();
    // Verify the model is visible
    cy.contains(model, { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
}


let creditLogCounter = 0;

const logCreditsToJSON = (models, responseData, successfulRuns, totalRuns) => {
    creditLogCounter++;

    const processModel = (index) => {
        if (index >= models.length) {
            return;
        }

        const model = models[index];
        if (creditLogCounter === 1) {
            cy.writeFile('cypress/fixtures/credits.json', []).then(() => {
                cy.log('Cleaned credits.json file');
            });
        }

        const logModelData = (model, avgCredits, avgResponseTime) => {
            cy.readFile('cypress/fixtures/credits.json').then((existingData) => {
                const newData = existingData || [];
                
                // Format ResponseTime as null if no successful runs
                const formattedResponse = successfulRuns === 0 ? 
                    null : 
                    `${Number(avgResponseTime)} secs.`;
                
                newData.push({
                    textModel: model,
                    Credits: avgCredits,
                    ResponseTime: formattedResponse,
                    RepRate: `${successfulRuns}/${totalRuns}`
                });
                
                cy.writeFile('cypress/fixtures/credits.json', newData).then(() => {
                    cy.log(`Logged data for ${model} - Average Credits: ${avgCredits || 'null'}, Average Response Time: ${avgResponseTime || 'null'}, RepRate: ${successfulRuns}/${totalRuns}`);
                    processModel(index + 1);
                });
            });
        };

        // Calculate averages from responseData
        if (responseData && responseData.length > 0) {
            const validResponses = responseData.filter(data => data.duration > 0);
            const avgResponseTime = validResponses.length > 0 ? 
                (validResponses.reduce((sum, data) => sum + data.duration, 0) / validResponses.length).toFixed(2) : 
                null;
            
            const creditsData = responseData.filter(data => data.credits !== null);
            const avgCredits = creditsData.length > 0 ? 
                Math.round(creditsData.reduce((sum, data) => sum + data.credits, 0) / creditsData.length) : 
                null;
            
            logModelData(model, avgCredits, avgResponseTime);
        } else {
            logModelData(model, null, null);
        }
    };

    // Start processing with first model
    processModel(0);
};

const uploadFile = (promptType) => {
    const testCase = prompts[promptType];
    // Click the upload button
    cy.get('[aria-label="Attach Files"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
  

    //Upload from computer
    cy.get('[role="button"]', { timeout: DEFAULT_TIMEOUT }).eq(2)
        .should('be.visible')
        .click();

    // Wait for file input to be ready and upload file
    cy.get('input[type="file"]', { timeout: DEFAULT_TIMEOUT })
        .should('exist')
        .and('not.be.disabled')
        .wait(2000) // Add wait for upload dialog to fully load
        .then(($input) => {
            // Verify input is ready
            cy.wrap($input)
                .should('have.prop', 'disabled', false)
                .selectFile(testCase.filepath, { force: true });
        });

    // Wait for upload completion indicators
    cy.intercept('POST', '**/createFabFile').as('uploadRequest');
    cy.wait('@uploadRequest', { timeout: 10000 });

    //Verify file uploaded
    cy.contains(testCase.filepath.split('/').pop(), { timeout: DEFAULT_TIMEOUT });

    cy.log('File uploaded successfully.');
    cy.wait(5000)
};

const fileOperation = (operation, promptType, newName) => {
    const testCase = prompts[promptType];
    const filename = testCase.filepath.split("/").pop();

    //Click on files button
    cy.get('[aria-label="Files"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    cy.get(".MuiModalDialog-root", { timeout: DEFAULT_TIMEOUT }).within(() => {
        // Click the date header twice to sort descending
        cy.contains("Date", { timeout: DEFAULT_TIMEOUT }).click({ force: true });
        cy.contains("Date", { timeout: DEFAULT_TIMEOUT }).click({ force: true });

        //Checks if file is present
        cy.contains(filename, { timeout: DEFAULT_TIMEOUT })
            .should("be.visible")
            .click();

        switch (operation) {
            case "checkFile":
                // File presence already verified above
                cy.log(`File ${filename} found successfully`);
                //Click Close button
                cy.get('[data-testid="CloseIcon"]', { timeout: DEFAULT_TIMEOUT })
                    .should("be.visible")
                    .click();
                break;

            case "renameFile":
                cy.get('button.file-browser-actions-menu-button', { timeout: DEFAULT_TIMEOUT })
                    .first()
                    .should('be.visible')
                    .click();

                //Click rename button. Temporarily search outside the modal
                cy.document().its('body').find('li[role="menuitem"]').contains('Rename', { timeout: DEFAULT_TIMEOUT })
                    .should("be.visible")
                    .click();

                cy.get('input[value="' + filename + '"]', { timeout: DEFAULT_TIMEOUT })
                    .should("be.visible")
                    .clear()
                    .type(newName)
                    .type("{enter}");

                cy.log(`File ${newName} renamed successfully`);
                break;

            case "deleteFile":
                //Click delete button
                cy.contains("Delete 1 File", { timeout: DEFAULT_TIMEOUT }).should("be.visible").click();
                cy.document().its('body').find('button').contains('Ok', { timeout: DEFAULT_TIMEOUT }).click();
                break;

            case "addFile":
                //click add file
                cy.contains("Add 1 File", { timeout: DEFAULT_TIMEOUT }).should("be.visible").click();

                //wait for file to be added
                cy.wait(2000);

                cy.log("File added to Notebook Successfully.");
                break;

            default:
                throw new Error(`Invalid file operation: ${operation}`);
        }
    });

    // After closing the modal, confirm the file operations
    switch (operation) {
        case "deleteFile":
            cy.contains(/Deleted \d+ files/, { timeout: DEFAULT_TIMEOUT })
                .should("be.visible")
            break;
    }
}

const handleResearchAgent = (action, agent) => {
    // Click File
    cy.get('[aria-label="Files"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();
    //Click Research button
    cy.get('[aria-label="Open Research"]', { timeout: DEFAULT_TIMEOUT })
        .should('be.visible')
        .click();

    switch(action) {
        case 'create':
            cy.contains('button', 'Create New Agent', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            cy.get('input[placeholder="Give your AI agent a memorable name..."]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .type(agent.agentName);

            cy.get('textarea[placeholder="Describe what this agent specializes in and what kind of research it should focus on..."]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .type(agent.description)
                .click();

            cy.contains('Create Agent', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            cy.contains('Research agent created successfully', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            break;

        case 'edit':     
            cy.contains(agent.agentName, { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click({ force: true });

            cy.get('[data-testid="EditIcon"]', { timeout: DEFAULT_TIMEOUT })
                .eq(1)
                .should('be.visible')
                .click();

            cy.get('input[placeholder="Give your AI agent a memorable name..."]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .clear()
                .type(agent.newName);

            cy.get('textarea[placeholder="Describe what this agent specializes in and what kind of research it should focus on..."]', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .clear()
                .type(agent.newDescription)
                .click();

            cy.contains('Save Changes', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            cy.contains('Research agent updated successfully', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            break;

        case 'delete':
            cy.contains(agent.newName, { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click({ force: true });

            cy.contains('button', 'Delete Agent', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            cy.get('.confirmation-modal-confirm-button', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible')
                .click();

            cy.contains('Research agent deleted successfully', { timeout: DEFAULT_TIMEOUT })
                .should('be.visible');
            break;

        default:
            throw new Error(`Invalid action: ${action}. Use 'create', 'edit', or 'delete'`);
    }
};


class Notebook {
    static createNotebook(prompt, model) {
        describe(`Text Model: ${model}`, () => {
            it.only(`Should select Text model. Creates notebook`, () => {
                selectTxtModel(model);
                createNote(prompt, model);
            });
        });
    }
    static renameNotebook(newName) {
        // it('Should rename a notebook', () => {
        describe(`Rename Notebook`, () => {
            it(`Rename a new notebook.`, () => {
                renameNote(newName);
            });
        });
    }
    static deleteNotebook(Name) {
        describe(`Delete Notebook`, () => {
            it(`Delete a notebook.`, () => {
                deleteNote(Name);
            });
        });
    }
    static selectTextModel(model) {
        it(`Should select a text model:${model}`, () => {
            selectTxtModel(model);
        });
    }
    static Files(filepath) {
        describe("Files Operations", () => {
          it("Adds file", () => {
            uploadFile(filepath);
            fileOperation("addFile", filepath);
          });

          it("Renames file", () => {
            uploadFile(filepath);
            fileOperation("renameFile", filepath, "RenamedFile");
          });

          it("Deletes file", () => {
            uploadFile(filepath);
            fileOperation("deleteFile", filepath);
          });
        });


    }
    static multiPrompts(promptType, model, promptNo) {
        it(`Text model:${model} Prompts: ${promptNo}`, () => {
            selectTxtModel(model);
            sendPrompt(promptType,promptNo,model)
        });
    }
    static multiUpload(promptType,model,promptNo) {
        it(`${model}: Upload file for ${promptType}.`, () => {
            selectTxtModel(model);
            uploadFile(promptType);
            fileOperation('addFile', promptType);
            sendPrompt(promptType,promptNo,model);
        });
    }
    static createNotebookWithAverage(prompt, model) {
        describe(`Text Model: ${model} - Average Response Time`, () => {
            const responseData = []; // Store both duration and credits
            const totalRuns = 3;

            beforeEach(() => {
                selectTxtModel(model);
            });

            // Run the test 3 times
            Array.from({ length: totalRuns }).forEach((_, index) => {
                it(`Run ${index + 1}: Create notebook and measure response time`, () => {
                    cy.wrap(createNote(prompt, model)).then(result => {
                        if (result && result.duration) {
                            // Format duration to 2 decimal places
                            const formattedDuration = Number(result.duration.toFixed(2));
                            responseData.push({
                                duration: formattedDuration,
                                credits: result.credits
                            });
                            cy.log(`Run ${index + 1} - Response time: ${formattedDuration} seconds, Credits: ${result.credits || 'null'}`);
                        }
                    });
                });
            });

            after(() => {
                const successfulRuns = responseData.filter(data => data.duration > 0).length;
                
                if (successfulRuns > 0) {
                    cy.log(`Total successful runs: ${successfulRuns} out of ${totalRuns}`);
                    cy.log('Individual run data:', JSON.stringify(responseData, null, 2));
                    
                    // Log with response data array containing both duration and credits
                    logCreditsToJSON([model], responseData, successfulRuns, totalRuns);
                } else {
                    cy.log(`No successful runs for ${model}`);
                    logCreditsToJSON([model], [], 0, totalRuns);
                }
            });
        });
    }
    static addNotebookTags(tags) {
        describe('Add Tags to Notebook', () => {
            it(`Should add tag: ${tags}`, () => {
                editNotebookInfo(tags);
            });
        });
    }
        static manageResearchAgent(agent) {
            describe(`Research Agent Operations for: ${agent.agentName}`, () => {
                it('Should create new agent.', () => {
                    handleResearchAgent('create', agent);
                });
                it(`Should edit it to ${agent.newName}.`, () => {
                    handleResearchAgent('edit', agent);
                });
                it(`Should delete ${agent.newName}.`, () => {
                    handleResearchAgent('delete', agent);
                });
            });
        }
    
}

export default Notebook;
export { getRandomTextModels, selectTxtModel };

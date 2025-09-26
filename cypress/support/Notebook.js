const prime = ['2', '3', '5', '7', '11'];
const capital = "Paris"
const textModels = ['Claude 4 Opus', 'O3', 'GPT-4.1', 'Gemini 2.5 Pro Preview']; // Add your text models here
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
    cy.contains(model, { timeout: 20000})
        .should('be.visible')

    // Click the "New Chat" button
    cy.xpath("//button[normalize-space()='Chat']" , { timeout: 20000 })
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

            cy.get('[data-testid="ai-response"]', { timeout: 60000 })
                .contains(testCase.answer, { timeout: 60000, matchCase: false })
                .should('be.visible')
                .then(() => {
                    const duration = (Date.now() - startTime) / 1000;
                    cy.log(`It took ${duration} seconds for the answer to appear and be visible.`);
                    resolve(duration);
                });
        });
    }
    cy.log('Notebook creation completed successfully.');
};


const sendPrompt = (promptType, promptNo, model) => {
    const testCase = prompts[promptType];

    // Click the "New Chat" button
    cy.xpath("//button[normalize-space()='Chat']" , { timeout: 20000 })
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
        cy.xpath('//textarea[@placeholder="Type your message here..."]')
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
            cy.get('.css-1aau1w6')
                .should('be.visible')
                .scrollTo('bottom', { ensureScrollable: true })
                .then(($container) => {
                    $container[0].scrollTop = $container[0].scrollHeight;
                });
        }

        // Handle both array and single answer verification
        if (Array.isArray(currentPromptData.answer)) {
            // For array of answers, check each one
            currentPromptData.answer.forEach((answer) => {
                cy.get('[data-testid="ai-response"]', { timeout: 60000 }).contains(answer, { timeout: 50000, matchCase: false })
                    .should('be.visible');
            });
        } else {
            // For single answer
            cy.get('[data-testid="ai-response"]', { timeout: 60000 }).contains(currentPromptData.answer, { timeout: 50000, matchCase: false })
                .should('be.visible');
        }

        cy.log(`Completed prompt ${currentPrompt + 1} of ${promptNo}`);
    };

    // Start sending prompts
    sendSinglePrompt(0);
};

const renameNote = (newName) => {
    //clicks notebook
    cy.get('[data-testid="sidenav-item-session-button"]')
        .eq(0)
        .should('be.visible')
        .click();

    //click elipsis button
    cy.get('[data-testid="sidenav-item-menu-button"]')
        .eq(0)
        .should('be.visible')
        .click();

    //click rename button
    cy.get('li[role="menuitem"]').eq(1)
        .should('be.visible')
        .click();

    //clicks notebook
    cy.get('[data-testid="sidenav-item-rename-input"]')
        .eq(0)
        .should('be.visible')
        .type(newName)
        .type('{enter}');

    cy.log('Notebook renamed successfully.');
};

const editNotebookInfo = (tags) => {
    //clicks notebook
    cy.get('[data-testid="sidenav-item-session-button"]')
        .eq(0)
        .should('be.visible')
        .click();

    //click elipsis button
    cy.get('[data-testid="sidenav-item-menu-button"]')
        .eq(0)
        .should('be.visible')
        .click();

    //click edit info button
    cy.get('.sidenav-item-menuitem-viewinfo')
        .should('be.visible')
        .click();

    //input a tag
    cy.get('input[placeholder="Add a tag"]')
        .should('be.visible')
        .type(tags);
    
    //click add tag button
    cy.xpath("//button[normalize-space()='Add Tag']")
        .should('be.visible')
        .click();

    //automation tag verification
    cy.contains('.session-metadata-tag', `${tags}100`, { timeout: 20000, matchCase: false })
        .should('be.visible');

    //click close button
    cy.get('.session-metadata-close-button')
        .should('be.visible')
        .click();

    cy.log('Notebook information edited successfully.');
};

const deleteNote = (Name) => {
    //clicks notebook
    cy.get('[data-testid="sidenav-item-session-button"]')
        .eq(0)
        .should('be.visible')
        .click();

    //click elipsis button
    cy.get('[data-testid="sidenav-item-menu-button"]')
        .eq(0)
        .should('be.visible')
        .click();

    //click delete button
    cy.get('li[role="menuitem"]').eq(10)
        .should('be.visible')
        .click();

    //confirm delete
    cy.get('[data-testid="confirm-delete-modal"] [data-testid="confirm-modal-confirm-btn"]')
        .should('be.visible')
        .click();

    //delete notification
    cy.contains('Successfully deleted session').should('exist');
};

const selectTxtModel = (model) => {
    cy.get('[data-testid="session-bottom-container"] [data-testid="ai-settings-button"]', {timeout: 50000})
        .eq(0)
        .should('be.visible')
        .click();

    //input text model
    cy.xpath("(//input[@placeholder='Search'])[3]")
        .should('be.visible')
        .type(model)
        .type('{enter}');

    //select text model
    cy.contains('div', model, { timeout: 50000, matchCase: false })
        .should('exist')
        .click({ force: true });

    // clicks close button
    cy.get(".MuiBox-root.css-6zgsse > button")
        .eq(1)
        .should('be.visible')
        .click();
    // Verify the model is visible
    cy.contains(model, { timeout: 20000})
        .should('be.visible')
}


let creditLogCounter = 0;

const logCreditsToJSON = (models,ResponseTime) => {
    creditLogCounter++ // Increment counter

    const processModel = (index) => {
        if (index >= models.length) {
            return;
        }

        const model = models[index];
        if (creditLogCounter == 1) {
            cy.writeFile('cypress/fixtures/credits.json', []);
            cy.log('Cleaned credits.json file');
        }

        // Click to view credits
        cy.get('[data-testid="credits-used"]', {timeout: 10000})
            .eq(0)
            .should('be.visible')
            .click();

        // Get credits value
        cy.contains('Credits Used', { timeout: 50000 })
            .should('be.visible')
            .invoke('text')
            .then((credits) => {
                // Extract only the number using regex
                const creditsNumber = credits.match(/\d+/)[0];
                // Read existing data first
                cy.readFile('cypress/fixtures/credits.json').then((existingData) => {
                    const newData = existingData || [];

                    // Add new credit data
                    newData.push({
                        textModel: model,
                        Credits: parseInt(creditsNumber),
                        ResponseTime: Number(ResponseTime)+ ' secs.'
                    });

                    // Write back the combined data
                    cy.writeFile('cypress/fixtures/credits.json', newData);
                });

                // Process next model
                processModel(index + 1);
            });
    };

    // Start processing with first model
    processModel(0);
};

const uploadFile = (promptType) => {
    const testCase = prompts[promptType];
    // Click the upload button
    cy.get('[data-testid="AttachFileIcon"]')
        .should('be.visible')
        .click();

    //Upload from computer
    cy.get('[role="button"]').eq(2)
        .should('be.visible')
        .click();

    // Wait for file input to be ready and upload file
    cy.get('input[type="file"]')
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
    cy.contains(testCase.filepath.split('/').pop());

    cy.log('File uploaded successfully.');
    cy.wait(5000)
};

const fileOperation = (operation, promptType, newName) => {
  const testCase = prompts[promptType];
  const filename = testCase.filepath.split("/").pop();

  //Click on files button
  cy.contains("Files").should("be.visible").click();

  cy.get(".MuiModalDialog-root").within(() => {
    // Click the date header twice to sort descending
    cy.contains("Date").click();
    cy.contains("Date").click();

    //Checks if file is present
    cy.contains(filename)
      .should("be.visible")
      .click();

    switch (operation) {
      case "checkFile":
        // File presence already verified above
        cy.log(`File ${filename} found successfully`);
        //Click Close button
        cy.get('[data-testid="CloseIcon"]')
          .should("be.visible")
          .click();
        break;

      case "renameFile":
        cy.xpath('(//*[name()="svg"][contains(@class,"lucide lucide-more-vertical")])[1]')
        //   .find('button')
          .should('be.visible')
          .click();

        //Click rename button. Temporarily search outside the modal
        cy.document().its('body').find('li[role="menuitem"]').contains('Rename')
          .should("be.visible")
          .click();

        cy.get('input[value="' + filename + '"]')
          .should("be.visible")
          .clear()
          .type(newName)
          .type("{enter}");

        cy.log(`File ${newName} renamed successfully`);
        //Click Close button
        // cy.get('[data-testid="CloseIcon"]').eq(2).should("be.visible").click();

        break;

      case "deleteFile":
        //Click delete button
        cy.contains("Delete 1 File").should("be.visible").click();
        cy.document().its('body').find('button').contains('Ok').click();
        break;

      case "addFile":
        //click add file
        cy.contains("Add 1 File").should("be.visible").click();

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
    // case "addFile":
    //   cy.get(".MuiChip-action").should("be.visible");
    //   break;
    case "deleteFile":
      cy.contains(/Deleted \d+ files/)
        .should("be.visible")
      break;
  }
}


const handleResearchAgent = (action, agent) => {
    // Click File
    cy.get('[aria-label="File Browser"]', { timeout: DEFAULT_TIMEOUT })
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
            it(`Should select Text model. Creates notebook`, () => {
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
            let responseTimes = [];

            beforeEach(() => {
                selectTxtModel(model);
            });

            // Run the test 3 times
            Array.from({ length: 3 }).forEach((_, index) => {
                it(`Run ${index + 1}: Create notebook and measure response time`, () => {
                    createNote(prompt, model).then(duration => {
                        // Format duration to 2 decimal places
                        const formattedDuration = Number(duration.toFixed(2));
                        responseTimes.push(formattedDuration);
                        cy.log(`Run ${index + 1} response time: ${formattedDuration} seconds`);
                    });
                });
            });

            after(() => {
                const average = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
                const formattedAverage = Number(average.toFixed(2));
                cy.log(`Average response time for ${model}: ${formattedAverage} seconds`);
                logCreditsToJSON([model], formattedAverage);
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
export { getRandomTextModels };

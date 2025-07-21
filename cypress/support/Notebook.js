const prime = ['2', '3', '5', '7', '11'];
const capital = "Paris"
const textModels = ['Claude 3.7 Sonnet', 'O3', 'GPT-4.1']; // Add your text models here
let notebookCreated = false;

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
    cy.contains('New Notebook')
        .should('be.visible');

    // Wait until the question appears
    cy.contains(testCase.prompt, { timeout: 50000 })
        .should('be.visible');

    // Handle both array and string answers
    if (Array.isArray(testCase.answer)) {
        testCase.answer.forEach((answer) => {
            cy.contains(answer, { timeout: 50000 }).should('be.visible');
        });
    } else {
        cy.contains(testCase.answer, { timeout: 10000 }).then($el => {
            if (!$el.length) {
                cy.log(`Error: Value "${testCase.answer}" not found within 10 secs`);
                throw new Error(`Value "${testCase.answer}" not found within 10 secs`);
            } else {
                cy.wrap($el).should('be.visible');
            }
        });
    }
    notebookCreated = true;
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
                cy.get('p.MuiTypography-root').contains(answer, { timeout: 50000, matchCase: false })
                    .should('be.visible');
            });
        } else {
            // For single answer
            cy.get('p.MuiTypography-root').contains(currentPromptData.answer, { timeout: 50000, matchCase: false })
                .should('be.visible');
        }

        cy.log(`Completed prompt ${currentPrompt + 1} of ${promptNo}`);
    };

    // Start sending prompts
    sendSinglePrompt(0);
};

const renameNote = (newName) => {
    //clicks notebook
    cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > button')
        .eq(0)
        .should('be.visible')
        .click();

    //click elipsis button
    cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > div > button')
        .eq(0)
        .should('be.visible')
        .click();

    //click rename button
    cy.get('li[role="menuitem"]').eq(1)
        .should('be.visible')
        .click();

    //clicks notebook
    cy.get('.MuiInput-sizeSm.Mui-focused.css-di36d5')
        .eq(0)
        .should('be.visible')
        .type(newName)
        .type('{enter}');

    cy.log('Notebook renamed successfully.');
};

const deleteNote = (Name) => {
    //clicks notebook
    cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > button')
        .eq(0)
        .should('be.visible')
        .click();

    //click elipsis button
    cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > div > button')
        .eq(0)
        .should('be.visible')
        .click();

    //click delete button
    cy.get('li[role="menuitem"]').eq(10)
        .should('be.visible')
        .click();

    //confirm delete
    cy.get('.MuiButton-sizeMd.css-25d5g8')
        .should('be.visible')
        .click();

    //delete notification
    cy.contains('Successfully deleted session').should('exist');
};

const selectTxtModel = (model) => {
    cy.get('.css-1bqn7pp', {timeout: 50000})
        .eq(0)
        .should('be.visible')
        .click();

    cy.get('.css-1fed3lh')
        .eq(1)
        .should('be.visible')
        .click();

    //select text model
    cy.contains('div', model, { timeout: 50000, matchCase: false })
        .should('exist')
        .click({ force: true });

    //clicks close button
    if(model !== 'GPT-4.1'){
        cy.get('.MuiBox-root.css-f0am11 > button')
            .eq(1)
            .should('be.visible')
            .click();
    }
    cy.contains(model, { timeout: 20000})
        .should('be.visible')
}


let creditLogCounter = 0;

const logCreditsToJSON = (models) => {
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
        cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > button > span', {timeout: 10000})
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
                        Credits: parseInt(creditsNumber)
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
    cy.get('li[role="menuitem"]').eq(1)
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


class Notebook {
    static createNotebook(prompt, model) {
        describe(`Text Model: ${model}`, () => {
            it(`Should select Text model.`, () => {
                selectTxtModel(model);
                createNote(prompt, model);
             });
            // it(`Create new notebook.`, () => {
            //     createNote(prompt, model);
            // });
            it(`Logging credits`, () => {
                if (notebookCreated) {
                    logCreditsToJSON([model]);
                }   
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
        it(`Upload file and validate reply for ${model}.`, () => {
            selectTxtModel(model);
            uploadFile(promptType);
            fileOperation('addFile', promptType);
            sendPrompt(promptType,promptNo,model);
        });
    }
}

export default Notebook;
export { getRandomTextModels };
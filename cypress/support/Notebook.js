const prime = ['2', '3', '5', '7', '11'];
const capital = "Paris"
const textModels = ['claude-3-7-sonnet', 'o3', 'gpt-4.1']; // Add your text models here
// const textModels = ['gpt-4.1']; // Add your text models here

let prompts;

before(() => {
    cy.fixture('prompts.json').then((promptsData) => {
        prompts = promptsData;
    });
});

const getRandomTextModels = (count) => {
    return textModels.sort(() => 0.5 - Math.random()).slice(0, count);
};

const createNote = (promptType) => {
    const testCase = prompts[promptType];
    // Click the "New Chat" button
    cy.get('.MuiButton-root.MuiButton-variantSolid.MuiButton-colorPrimary')
        .eq(0)
        .should('be.visible')
        .click();

    // Type the question in the textarea
    cy.get('.MuiTextarea-root')
        .should('be.visible')
        .type(testCase.prompt)
        .type('{enter}');

    // Wait until the notebook is created
    cy.contains('New Notebook')
        .should('be.visible');

    // Wait until the question appears
    cy.contains('prime', { timeout: 10000 })
        .should('be.visible');

    // Handle both array and string answers
    if (Array.isArray(testCase.answer)) {
        testCase.answer.forEach((answer) => {
            cy.contains(answer, { timeout: 10000 }).should('be.visible');
        });
    } else {
        cy.contains(testCase.answer, { timeout: 10000 }).should('be.visible');
    }

    cy.log('Notebook creation completed successfully.');
};


const sendPrompt = (promptType, promptNo, model) => {
    const testCase = prompts[promptType];

    // Click the "New Chat" button
    cy.get('.MuiButton-root.MuiButton-variantSolid.MuiButton-colorPrimary')
        .eq(0)
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
        cy.get('.MuiTextarea-root')
            .should('be.visible')
            .type(currentPromptData.prompt)
            .type('{enter}');
        
        if(model == 'claude-3-7-sonnet'){
            // Initial longer wait for model initialization
            // Use longer wait for first prompt, shorter for subsequent ones
            if (currentPrompt === 0) {
                cy.wait(5000); // First prompt
            } else {
                cy.wait(2000); // Subsequent prompts
            }
            // Wait for the response to appear
            cy.get('.css-18sok60')
                .should('be.visible', { timeout: 10000 });

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
                cy.contains(answer, { timeout: 50000 })
                    .should('be.visible');
            });
        } else {
            // For single answer
            cy.contains(currentPromptData.answer, { timeout: 50000 })
                .should('be.visible');
        }

        cy.log(`Completed prompt ${currentPrompt + 1} of ${promptNo}`);
        // Send next prompt
        sendSinglePrompt(currentPrompt + 1);
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
    cy.get('.MuiInput-sizeSm.Mui-focused.css-b3dpgg')
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
    cy.get('.css-14uw3z2')
        .should('be.visible')
        .click();

    cy.get('.css-1fed3lh')
        .should('be.visible')
        .click();

    //select text model
    cy.contains(model)
        .should('exist')
        .click({ force: true });

    //clicks close button
    if(model !== 'gpt-4.1'){
        cy.get('.MuiBox-root.css-f0am11 > button')
            .should('be.visible')
            .click();
    }
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
        cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > button > span')
            .eq(0)
            .should('be.visible')
            .click();

        // Get credits value
        cy.contains('Credits Used')
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

    // Click the upload button
    cy.get('.css-ilpbvj > .MuiIconButton-root')
        .should('be.visible')
        .click();

    //Verify file uploaded
    cy.contains(testCase.filepath.split('/').pop());

    cy.log('File uploaded successfully.');

    //close files modal
    cy.get('.css-1122oev > .MuiIconButton-root')
        .should('be.visible')
        .click();
};

const fileOperation = (operation, promptType, newName) => {
    const testCase = prompts[promptType];
    const filename = testCase.filepath.split('/').pop()

    //resize the window
    cy.viewport(1280, 800);

    //Click on files button
    cy.get('.css-1ajop3b')
        .should('be.visible')
        .click();

    //Checks if file is present
    cy.get('.css-1d3w5bb').eq(0)
        .should('have.text', filename)
        .should('be.visible')
        .click();

    switch (operation) {
        case 'checkFile':
            // File presence already verified above
            cy.log(`File ${filename} found successfully`);
            //Click Close button
            cy.get('.css-1122oev')
                .should('be.visible')
                .click();
            break;

        case 'renameFile':
            //click elipsis button
            cy.get('.MuiBox-root.css-1qbii0y > div > div > button')
                .eq(0)
                .should('be.visible')
                .click();
            //click rename button
            cy.get('li[role="menuitem"]').eq(1)
                .should('be.visible')
                .click({ force: true });

            cy.get('.MuiBox-root.css-8atqhb > div > input')
                .should('be.visible')
                .clear()
                .type(newName)
                .type('{enter}');

            cy.log(`File ${newName} renamed successfully`);
            //Click Close button
            cy.get('.css-1122oev')
                .should('be.visible')
                .click();
            break;

        case 'deleteFile':
            //Click delete button
            cy.get('.css-x1bfaw')
                .should('be.visible')
                .click();

            //Confirm delete message
            cy.contains('Non-existent files removed from projects successfully')
                .should('be.visible')
                .click();

            //Click Close button
            cy.get('.css-1122oev')
                .should('be.visible')
                .click();
            break;

        case 'addFile':

            //click add file
            cy.get('.css-1r0lsol > .MuiBox-root > .MuiButton-colorPrimary')
                .should('be.visible')
                .click();

            //close files modal
            cy.get('.css-1122oev > .MuiIconButton-root')
                .should('be.visible')
                .click();

            //wait for file to be added
            cy.wait(2000);

            //verify file added
            cy.get('.MuiChip-action')
                .should('be.visible')

            //delete added file
            cy.get('[data-testid="CancelIcon"]')
                .eq(0)
                .should('be.visible')
                .click();

            cy.log('File added to Notebook Successfully.');
            break;

        default:
            throw new Error(`Invalid file operation: ${operation}`);
    }

}


class Notebook {
    static createNotebook(prompt, model) {
        it(`Should select Text model:${model} and create a new notebook`, () => {
            selectTxtModel(model);
            createNote(prompt);

        });
        it(`Should log credits for ${model}.`, () => {
            logCreditsToJSON([model])
        });
    }
    static renameNotebook(newName) {
        it('Should rename a notebook', () => {
            renameNote(newName);
        });
    }
    static deleteNotebook(Name) {
        it('Should delete a notebook', () => {
            deleteNote(Name);
        });
    }
    static selectTextModel(model) {
        it(`Should select a text model:${model}`, () => {
            selectTxtModel(model);
        });
    }
    static Files(filepath) {
        it('Verify Files Operations', () => {
            uploadFile(filepath);
            fileOperation('checkFile', filepath);
            fileOperation('addFile', filepath);
            fileOperation('renameFile', filepath, 'RenamedFile');
            fileOperation('deleteFile', filepath);
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
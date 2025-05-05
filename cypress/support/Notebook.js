const prime = ['2', '3', '5', '7', '11'];
const textModels = ['claude-3-7-sonnet','o3', 'gpt4o-mini']; // Add your text models here

const getRandomTextModels = (count) => {
    return textModels.sort(() => 0.5 - Math.random()).slice(0, count);
};

const createNote = (prompt,filepath) => {
    const filename = filepath.split('/').pop()
    // Click the "New Chat" button
    cy.get('.MuiButton-root.MuiButton-variantSolid.MuiButton-colorPrimary')
        .eq(0)
        .should('be.visible')
        .click();

    // Upload file if filepath is provided
    uploadFile(filepath);

    // Type the question in the textarea
    cy.get('.MuiTextarea-root')
        .should('be.visible')
        .type(prompt)
        .type('{enter}');

    // Wait until the notebook is created
    cy.contains('New Notebook')
        .should('be.visible');

    // Wait until the question appears
    cy.contains('prime', { timeout: 10000 })
        .should('be.visible');

    // Wait until all prime numbers are visible
    prime.forEach((primeNumber) => {
        cy.contains(primeNumber,  { timeout: 10000 }).should('be.visible');
    });

    // checks file if uploaded
    fileOperation('checkFile', filename);

    //Delete file
    fileOperation('deleteFile', filename);

    cy.log('Notebook creation completed successfully.');
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
    cy.get('.MuiBox-root.css-f0am11 > button')
        .should('be.visible')
        .click();
}

let creditLogCounter = 0;

const logCreditsToJSON = (models) => {
    creditLogCounter++ // Increment counter

    const processModel = (index) => {
        if (index >= models.length) {
            return;
        }

        const model = models[index];
        if(creditLogCounter == 1){
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

const uploadFile = (filepath) => {
    // Click the upload button
    cy.get('.MuiMenuButton-sizeMd:nth-child(1)')
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
                .selectFile(filepath, { force: true });
        });

    // Wait for upload completion indicators
    cy.intercept('POST', '**/createFabFile').as('uploadRequest');
    cy.wait('@uploadRequest', { timeout: 10000 });

    cy.log('File uploaded successfully.');

};

const fileOperation = (operation, filename, newName) => {
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
            break;

        case 'renameFile':
            //click elipsis button
            cy.get('.MuiBox-root.css-1qbii0y > div > div > button')
                .should('be.visible')
                .click();
            //click rename button
            cy.get('li[role="menuitem"]').eq(1)
                .should('be.visible')
                .click();

            cy.get('.MuiBox-root.css-8atqhb > div > input')
                .should('be.visible')
                .clear()
                .type(newName)
                .type('{enter}');

            cy.log(`File ${newName} renamed successfully`);
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
            break;

        default:
            throw new Error(`Invalid file operation: ${operation}`);
    }
    //Click Close button
    cy.get('.css-1122oev')
        .should('be.visible')
        .click();
}
        

class Notebook {
    static createNotebook(prompt,model,filepath) {
        it(`Should select Text model:${model} and create a new notebook`, () => {
            selectTxtModel(model);
            createNote(prompt,filepath); 
            
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
    static uploadFileToNotebook(filepath) {
        it(`Should upload file: ${filepath}`, () => {
            uploadFile(filepath);
        });
    }
}

export default Notebook;
export { getRandomTextModels };
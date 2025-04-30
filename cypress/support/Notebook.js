const prime = ['2', '3', '5', '7', '11'];
const textModels = ['claude-3-7-sonnet', 'gpt40', 'o3', 'gpt4o-mini', 'gemini-1-5-pro']; // Add your text models here

const getRandomTextModels = (count) => {
    return textModels.sort(() => 0.5 - Math.random()).slice(0, count);
};

const createNote = (prompt) => {
    // Click the "New Chat" button
    cy.get('.MuiButton-root.MuiButton-variantSolid.MuiButton-colorPrimary')
        .eq(0)
        .should('be.visible')
        .click();

    // Type the question in the textarea
    cy.get('.MuiTextarea-root')
        .should('be.visible')
        .type(prompt);

    // Click the "Enter" button
    cy.get('.MuiButton-sizeMd.css-utr5pu')
        .should('be.visible')
        .click();

     //wait for 3 secs   
    cy.wait(5000)

    // Verify the notebook is created
    cy.contains('New Notebook').should('be.visible');

    //checks question
    cy.contains('prime').should('be.visible');

    //checks prompt
    cy.get('.MuiBox-root.css-pi8h4b > div').eq(0)
        prime.forEach((prime) => {
            cy.contains(prime).should('be.visible');
        });

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
    //select Text model button
    cy.get('.MuiButton-sizeSm.css-1qb65wz')
        .should('be.visible')
        .click();

    // Click model settings
    cy.get('.MuiStack-root.css-1mi3tt8 > div > div:nth-child(2)')
        .should('be.visible')
        .click();

    //click text model dropdown
    cy.get('.MuiBox-root.css-1vplol6')
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

class Notebook {
    static createNotebook(prompt,model) {
        it(`Should select Text model:${model} and create a new notebook`, () => {
            selectTxtModel(model);
            createNote(prompt); 
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
}

export default Notebook;
export { getRandomTextModels };
const prime = ['2', '3', '5', '7', '11'];

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
    cy.get('.MuiButton-sizeMd.css-8yhwlq')
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
        .should('be.visible')
        .click();

    //click elipsis button
    cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > div > button')
        .should('be.visible')
        .click();

    //click rename button
    cy.get('li[role="menuitem"]').eq(1)
        .should('be.visible')
        .click();   

    //clicks notebook
    cy.get('.MuiInput-sizeSm.Mui-focused.css-b3dpgg')  
        .should('be.visible')
        .type(newName)
        .type('{enter}');

    cy.log('Notebook renamed successfully.');
};

const deleteNote = (Name) => {
    //clicks notebook
    cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > button')
        .should('be.visible')
        .click();

    //click elipsis button
    cy.get('.MuiStack-root.css-1bzhh82 > div:nth-child(1) > div > div > button')
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

class Notebook {
    static createNotebook(prompt) {
        it('Should create a new notebook', () => {
            createNote(prompt); // Pass the notebookName argument
        });
    }

    static renameNotebook(newName) {
        it('Should rename a notebook', () => {
            renameNote(newName); // Pass the oldName and newName arguments
        });
    }

    static deleteNotebook(Name) {
        it('Should delete a notebook', () => {
            deleteNote(Name); 
        });
    }
}

export default Notebook;
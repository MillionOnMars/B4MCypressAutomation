const createNote = (notebookName) => {
    // Click the "Create Notebook" button
    cy.get('.MuiButton-root.MuiButton-variantSolid.MuiButton-colorPrimary')
        .eq(0)
        .should('be.visible')
        .click();

    // Type the notebook name in the textarea
    cy.get('.MuiTextarea-root')
        .should('be.visible')
        .type(notebookName);

    // Click the "Enter" button
    cy.get('.MuiButton-sizeMd.css-8yhwlq')
        .should('be.visible')
        .click();

    // Verify the notebook is created
    cy.contains('span', 'New Notebook').should('be.visible');
    cy.log('Notebook creation completed successfully');
};

const renameNote = (oldName, newName) => {
    // Locate the notebook by its current name
    cy.contains('span', oldName)
        .should('be.visible')
        .click();

    // Click the "More Options" button
    cy.get('[data-testid="MoreVertIcon"]')
        .should('be.visible')
        .click();

    // Click the "Rename" button
    cy.get('[data-cy="rename-notebook-button"]')
        .should('be.visible')
        .click();

    // Type the new notebook name
    cy.get('[data-cy="notebook-name-input"]')
        .should('be.visible')
        .clear()
        .type(newName);

    // Save the new name
    cy.get('[data-cy="save-notebook-button"]')
        .should('be.visible')
        .click();

    // Verify the notebook name has been updated
    cy.contains('span', newName).should('be.visible');
    cy.log('Notebook renamed successfully');
};

class Notes {
    static createNotebook(notebookName) {
        it('should create a new notebook', () => {
            createNote(notebookName); // Pass the notebookName argument
        });
    }

    static renameNotebook(oldName, newName) {
        it('should rename a notebook', () => {
            renameNote(oldName, newName); // Pass the oldName and newName arguments
        });
    }
}

export default Notes;
import { login } from '../support/login.js';
import Notebook, { getRandomTextModels }  from '../support/Notebook.js'; // Correctly import the default export

describe("Prompts", () => {
  const randomTextModels = getRandomTextModels(3);
  // Log in to the application before running the tests

  beforeEach(() => {
      // Load existing user credentials from accounts.json
      cy.fixture("accounts.json").then((accounts) => {
      const { username, password } = accounts.existingUsers.admin;
      login(username, password);
        // create a new notebook
        cy.xpath("//button[normalize-space()='Chat']", { timeout: 60000 })
          .should('be.visible')
          .click();
    });
  });

  //Choose 3 random text models and create a new notebook
  randomTextModels.forEach((model) => {
      Notebook.multiPrompts("capital", model, 30);
      Notebook.multiUpload("txt-recipe", model, 4);
      Notebook.multiUpload("image-cat", model, 4);
      Notebook.multiUpload("pdf-lorem", model, 4);
    });
  Notebook.imgPrompts("dog-image", 'GPT-Image-1');

});
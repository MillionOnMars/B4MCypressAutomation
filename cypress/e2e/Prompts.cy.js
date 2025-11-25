import { login } from '../support/login.js';
import Notebook, { getRandomTextModels, TEXT_MODELS } from '../support/Notebook.js';

describe("Prompts", () => {
  const randomTextModels = getRandomTextModels(2, [TEXT_MODELS.GPT_5_Nano]);

  // Define available upload types
  const uploadTypes = ['txt-recipe', 'image-cat', 'pdf-lorem'];

  // Function to get random upload type
  const getRandomUploadType = () => {
    return uploadTypes[Math.floor(Math.random() * uploadTypes.length)];
  };

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

  // Choose 2 random text models and create a new notebook
  randomTextModels.forEach((model) => {
    const randomUpload = getRandomUploadType();

    Notebook.multiPrompts("capital", model, 30);
    Notebook.multiUpload(randomUpload, model, 4);
  });

  Notebook.imgPrompts("dog-image", 'GPT-Image-1');
});

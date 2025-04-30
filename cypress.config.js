const { defineConfig } = require("cypress");

// module.exports = defineConfig({
//   e2e: {
//     setupNodeEvents(on, config) {
//       // implement node event listeners here
//     },
//   },
// });

module.exports = defineConfig({
  e2e: {
      supportFile: 'cypress/support/index.js', // Ensure this path is correct
  },
});

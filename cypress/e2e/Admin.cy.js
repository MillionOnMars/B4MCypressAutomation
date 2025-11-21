import { login } from '../support/login.js';
import Admin from '../support/Admin.js';

describe('Admin Tests', () => {
    beforeEach(() => {
        // Load existing user credentials from accounts.json
        cy.fixture('accounts.json').then((accounts) => {
            const { username, password } = accounts.existingUsers.admin;
            login(username, password);
        });
    });
    // Search User
    Admin.User('Automation', 'b4m-automationa@milliononmars.com');
    // Sort User by Name
    Admin.Sort('AAAutomation', 'Name');
    //Create User
    Admin.CreateUser('b4m-automation+11@milliononmars.com,Create,Admin,100,10');
    //Edit User
    Admin.EditUser();
    //Delete User
    Admin.DeleteUser('Edited name');
    //Create Invite Code
    Admin.CreateInviteCode('b4m-auto');
    //Use Invite Code
    Admin.UseInviteCode();
    //Delete User created with Invite Code and created Invite Code
    Admin.DeleteInviteCode('Automation User');
});

import { findOneUser, findAllUsers, closeDbConnection } from './mongodb.js';

//const { findOneUser, findAllUsers, closeDbConnection } = require('./test.js');

const testMongoDB = async () => {
    try {
        // Test findOneUser
        console.log("Finding user 'testuser'...");
        const user = await findOneUser('testuser');
        console.log("Result:", user);

        // Test findAllUsers
        console.log("Finding all users...");
        const allUsers = await findAllUsers();
        console.log("All Users:", allUsers);
    } catch (error) {
        console.error("Test failed", error);
    } finally {
        await closeDbConnection();
    }
};

testMongoDB();

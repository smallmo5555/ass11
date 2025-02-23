import { openDbConn, closeDbConnection } from './mongodb.js';

const testConnection = async () => {
    try {
        const db = await openDbConn();
        console.log("Connected to database:", db.databaseName);
    } catch (error) {
        console.error("Database connection failed:", error);
    } finally {
        await closeDbConnection();
    }
};

testConnection();

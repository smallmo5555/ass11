import express from 'express';
import userRecordsRoute from './routes/userRecords.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Register Routes
app.use('/api', userRecordsRoute);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${3000}`);
});

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct absolute path
dotenv.config({
    path: './.env'
});

// Use dynamic imports to ensure dotenv is loaded first
const { app } = await import('./app.js');
const { connectDB } = await import('./db/index.js');

const PORT = process.env.PORT || 8001;

// Connect to database
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
    })
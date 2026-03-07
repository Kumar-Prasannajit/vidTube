import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB } from './db/index.js';

//dotenv configuration
dotenv.config({
    path: './.env'
});

const PORT = process.env.PORT || 8001;

//connect to database
connectDB()
    .then(() => {
        //start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
    })
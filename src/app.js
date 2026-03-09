import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

//CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));

//common middlewares
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

//import routes
import healthCheckRoutes from './routes/healthCheck.routes.js';
import userRouter from "./routes/user.routes.js";

//use routes
app.use('/api/v1/healthcheck', healthCheckRoutes);
app.use("/api/v1/users", userRouter);

export { app };
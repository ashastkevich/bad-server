import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import mongoose from 'mongoose'
import path from 'path'
import rateLimit from 'express-rate-limit'
import { DB_ADDRESS } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env;
const app = express();

app.use(cookieParser());

// app.use(cors())
app.use(cors({ origin: process.env.ORIGIN_ALLOW || 'http://localhost', credentials: true }));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(serveStatic(path.join(__dirname, 'public')));

app.use(urlencoded({ extended: true, limit: '10kb' }));
app.use(json({ limit: '10kb' }));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.options('*', cors({ origin: process.env.ORIGIN_ALLOW || 'http://localhost', credentials: true }));
app.use(routes);
app.use(errors());
app.use(errorHandler);

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS);
        await app.listen(PORT, () => console.log('ok'));
    } catch (error) {
        console.error(error);
    }
}

bootstrap();

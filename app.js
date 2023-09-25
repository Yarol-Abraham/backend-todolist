const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cors = require('cors');
const expressMongoSanatize = require('express-mongo-sanitize');
const expressRateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const globalErros = require('./controllers/errorController');
const AppError = require('./utils/appError');
//routes
const userRouter = require('./routes/userRouter');
const todoRouter = require('./routes/todoRouter');

//enveroment global
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

const app = express();
//folder public
app.use(express.static(path.join(__dirname, 'public')));
//cors
const opCors = {
    origin: process.env.API_FRONTD
}
// opCors
app.use(cors() );
//Security Headers
app.use( helmet() );

//limits request
const limiter = expressRateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
});
app.use('/api', limiter );
//json
app.use( express.json({ limit: '10kb' }) );
app.use( express.urlencoded({ extended: true }) );
app.use( cookieParser() );
//sanatize
app.use( expressMongoSanatize() );
//xss
app.use( xss() );
//routes
app.use( '/api/v1/user', userRouter );
app.use( '/api/v1/todo', todoRouter );
//capture error url
app.use('*', (req, res, next)=>{
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404) );
});
//global errores
app.use(globalErros);

module.exports = app;

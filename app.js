const express = require('express');
const helmet = require('helmet');
const expressMongoSanatize = require('express-mongo-sanitize');
const expressRateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const globalErros = require('./controllers/errorController');
const appError = require('./utils/appError');

const app = express();
//Security Headers
app.use( helmet() );

//limits request
const limiter = expressRateLimit({
    max: 100,
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

//capture error url
app.use('*', (req, res, next)=>{
    next(appError(`can't find ${req.originalUrl} on this server`, 404) );
});
//global errores
app.use(globalErros);

module.exports = app;

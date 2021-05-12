const AppError = require('../utils/appError');

const handleValidateErrorsFields= (errors)=>{
    let message = "";
    Object.values(errors).forEach(err => {
        message += `${err.properties.message}. `;
    });
    message = message.trim();
    return new AppError(message, 400);
};
const handleDuplicateError = (error)=>{
    const { keyValue: { name } } = error;
    const message = `Duplicate field value: ${name}. Please use another value!`;
    return new AppError(message, 400);
};

const handleValidationJswErros = () =>{
    return new AppError("Invalid token, Please log in again", 401);
};

const handleValidationJswExpired = () =>{
    return new AppError("Your token has expired!, Please log in again", 401);
};

const sendErrorDev = (err, res)=>{
    res.status(err.statusCode).send({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    }); 
};

const sendErroProd = (err, res)=>{
    if(err.isOperational){
       return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    };
    
    return res.status(500).json({
        status: "error",
        message: "Something went very wrong"
    });
};

module.exports = (err, req, res, next)=>{
    err.statusCode =  err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err, res);
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = { ...err };
        error.message = err.message;
        if(error.errors) error = handleValidateErrorsFields(error.errors);
        if(error.code === 11000) error = handleDuplicateError(error);
        if(error.name === "JsonWebTokenError") error = handleValidationJswErros();
        if(error.name === "TokenExpiredError") error = handleValidationJswExpired();
        sendErroProd(error, res);
    };
};
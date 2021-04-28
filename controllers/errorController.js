const AppError = require('../utils/appError');

const handleValidateErrorsFields= (errors)=>{
    let message = "";
    Object.values(errors).forEach(err => {
        message += `${err.properties.message}. `;
    });
    message = message.trim();
    return new AppError(message, 400);
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
        sendErroProd(error, res);
    };
};
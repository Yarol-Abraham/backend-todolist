
const sendErrorDev = (err, res)=>{
    console.log(err);
};

const sendErroProd = (err, res)=>{

};

module.exports = (err, req, res, next)=>{

    if(process.env.NODE_ENV === 'development'){
        sendErroDev(err, res);
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = { ...err };
        sendErroProd(error, res);
    };
};
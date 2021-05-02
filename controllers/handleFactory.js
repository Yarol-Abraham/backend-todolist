const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const sendResponse = (doc, res, statusCode)=>{
    res.status(statusCode).json({
        status: 'success',
        results: doc.length,
        data: doc
    });
}

const optionsModel = (nameModel, req)=>{
    let options = {};
    if(nameModel === 'Todo') 
    {
        options = { slug: req.params.slug, user: req.user._id };
    }
    else if(nameModel === 'User'){
        options = { _id: req.user._id }
    };
    return options;
}

exports.getOne = (Model, nameModel) => catchAsync(async(req, res, next)=>{
    const doc = await Model.findOne(optionsModel(nameModel, req));
    if(!doc) return next(
        new AppError('No document found with that name', 404)
    );
    sendResponse(doc, res, 200); 
});

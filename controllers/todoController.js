const Todo = require('../models/todoModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const slugify = require('slugify');
const sendResponse = (doc, res, statusCode)=>{
    res.status(statusCode).json({
        status: 'success',
        results: doc.length,
        data: doc
    });
}

const filterData = (object, ...fields)=>{
    let newObject = {};
    Object.keys(object).forEach(el => {
        if(fields.includes(el)) newObject[el] = object[el];
    });
    return newObject;
}

exports.createTodo = catchAsync(async(req, res, next)=>{
    const todo = await Todo.create(req.body);
    todo.user = req.user._id;
    await todo.save();
    sendResponse(todo, res, 201);
});

exports.getTodo = catchAsync(async(req, res, next)=>{
    const todo = await Todo.findOne({ slug: req.params.slug });
    if(!todo) return next(
        new AppError('No document found with that ID', 404)
    );
    sendResponse(todo, res, 200); 
});

exports.getAllComplete =(req, res, next)=>{
    req.optionsTodo = "incomplete";
    next();
};

exports.getAllIncomplete = (req, res, next)=>{
    req.optionsTodo = "completed";
    next();
};

exports.getAllTodo = catchAsync(async(req, res, next)=>{
    const list = await Todo.find({ state: { $ne: req.optionsTodo } });
    sendResponse(list, res, 200);
});

exports.deleteTodo = catchAsync(async(req, res, next)=>{
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if(!todo) return next(new AppError('No document found with that ID', 404));
    sendResponse(todo, res, 200);
});

exports.updateTodo = catchAsync(async(req, res, next)=>{
    const filterBody = filterData(req.body, 'name', 'state', 'active');
    const todo = await Todo.findByIdAndUpdate(req.params.id, filterBody, {
        new: true,
        runValidators: true,
        context: 'query'
    });
    if(!todo) return next(new AppError('No document found with that ID', 404));
    todo.slug = slugify(todo.name, { lower: true });
    await todo.save();
    sendResponse(todo, res, 200);
});
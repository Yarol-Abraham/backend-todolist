const Todo = require('../models/todoModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const slugify = require('slugify');
const apiFectures = require('../utils/apiFectures');
const Factory = require('./handleFactory');

const sendResponse = (doc, res, statusCode)=>{
    res.status(statusCode).json({
        status: 'success',
        results: doc.length,
        data: doc
    });
}

exports.createTodo = catchAsync(async(req, res, next)=>{
    const todo = await Todo.create(req.body);
    todo.user = req.user._id;
    await todo.save();
    sendResponse(todo, res, 201);
});

exports.getTodo = Factory.getOne(Todo, 'Todo');

exports.getAllComplete =(req, res, next)=>{
    req.optionsTodo = "incomplete";
    next();
};

exports.getAllIncomplete = (req, res, next)=>{
    req.optionsTodo = "completed";
    next();
};

exports.getAllTodo = catchAsync(async(req, res, next)=>{
    const { page, limit } = req.query;
    const list = await Todo
    .find( 
        apiFectures
        .getAllTodoOptions( 
            req.optionsTodo, 
            req.user._id
        ) 
    )
    .sort( apiFectures.sortSelect(req.query.sort) )
    .skip( apiFectures.paginate(page, limit).skip )
    .limit( apiFectures.paginate(page, limit).limit );
    sendResponse(list, res, 200);
});

exports.deleteTodo = catchAsync(async(req, res, next)=>{
    const todo = await Todo.findOneAndDelete(
        {
            _id: req.params.id, 
            user: req.user._id 
        }
    );
    if(!todo) return next(new AppError('No document found with that ID', 404));
    sendResponse(todo, res, 200);
});

exports.deleteAllTodo = catchAsync( async(req, res, next)=>{
    await Todo.deleteMany({
        user: req.user._id,
        state: "completed"
     });
     res.status(200).json({
         status: 'success',
         message: "all records have been deleted"
     })
});

exports.updateTodo = catchAsync(async(req, res, next)=>{
    const filterBody = apiFectures.filterData(req.body, 'name', 'state', 'active');
    const todo = await Todo.findOneAndUpdate(
        { 
            _id: req.params.id, 
            user: req.user._id 
        }, 
        filterBody, 
        {
            new: true,
            runValidators: true,
            context: 'query'
        }
    );
    if(!todo) return next(new AppError('No document found with that ID', 404));
  if(req.body.name){
    todo.slug = slugify(todo.name, { lower: true });
    await todo.save();
  };
    sendResponse(todo, res, 200);
});
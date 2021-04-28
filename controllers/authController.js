const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

const signToken = (_id)=>{
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  });
};

const sendToken = (user, res, statusCode)=>{
  const token =  signToken(user._id);
  const cookiesOptions = {
    expires: new Date( Date.now() + process.env.JW_COOKIE_EXPIRES * 24 * 60 * 60 * 1000 ),
    httpOnly: true
  };

  if(process.env.NODE_ENV === 'production') cookiesOptions.secure = true;
  user.password = undefined;
  res.cookie('jwt', token, cookiesOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next)=>{
  const newUser = await User.create(req.body);
  sendToken(newUser, res, 201);
});

exports.login = catchAsync(async (req, res, next)=>{
  const { name, password } = req.body;
  if(!name || !password) return next( 
    new AppError('Please provide your name and password', 400) 
  );
  const user = await User.findOne({ name }).select('+password');
  const verifyPassword = await user.correctPassword(password, user.password);
 
  if(!verifyPassword) return next(
    new AppError('Please provide your name and password', 400)
  );
  sendToken(user, res, 200);
});

exports.loggout = catchAsync(async(req, res, next)=>{
    
});

exports.protect = catchAsync(async(req, res, next)=>{
  let token;
  if(
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
    ){
      token = req.headers.authorization.split(' ')[1];
  }else{
    token = req.cookie.jwt;
  };
  //TODO: Terminar el protect - verificar el password si a sido modificado

});

exports.updatePassword = catchAsync(async(req, res, next)=>{
  
});

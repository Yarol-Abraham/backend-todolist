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
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000 ),
      httpOnly: true
    });
    res.status(200).json({ status: "success" });
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
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded._id);
  if(!currentUser) return next(
    new AppError("The user belonging to this user does no longer exist.", 401)
  );
  //check is modified password has changed recently
  const verifyChangedPassword = currentUser.changedPasswordAfter(decoded.iat);
  if(verifyChangedPassword) return next( 
    new AppError("User recently changed password! Please log in again", 401)
  );
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.updatePassword = catchAsync(async(req, res, next)=>{
  const { password, newPassword, passwordConfirm } = req.body;
  
  if(!password || !newPassword || !passwordConfirm) return next(
      new AppError("Plese provides A password, new password and password Confirm", 401)
  );
  const user = await User.findById(req.user._id).select('+password');
  const verifyPassword = await user.correctPassword(password, user.password);
  if(!verifyPassword) return next(
    new AppError('password is Invalided', 400)
  );
  user.password = newPassword;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  sendToken(user, res, 200);
});

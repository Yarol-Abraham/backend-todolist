const User = require('../models/userModel');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./handleFactory');
const apiFectures = require('../utils/apiFectures');
const multerSotarge = multer.memoryStorage();

const multerFilter = (req, file, cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null, true);
    }else{
        cb(new AppError("Not an image! Please upload only image", 400), false);
    };
};

const upload = multer({
    storage: multerSotarge,
    fileFilter: multerFilter
});

exports.updatePhoto = upload.single('photo');

exports.resizePhoto = catchAsync(async(req, res, next)=>{
    if(!req.file) return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/images/user/${req.file.filename}`);
    next();
});

exports.getMe = Factory.getOne(User, 'User');

exports.updateMe = catchAsync(async(req, res, next)=>{
    const { password, passwordConfirm } = req.body;
    if(password || passwordConfirm) return next(
        new AppError("This route is not for password updates. Please use /updatePassword", 400)
    );
    const filterBody = apiFectures.filterData(req.body, 'name');
    if(req.file) filterBody.photo = req.file.filename;
    const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
        new: true,
        runValidators: true
    });
     res.status(200).json({
        status: 'success',
        data: {
            user
        }
    });
});



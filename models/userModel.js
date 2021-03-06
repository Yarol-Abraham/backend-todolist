//enveroment global
const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');


const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            unique: true,
            trim: true,
            required: [true, 'Please tell us your name']
        },

        photo: {
            type: String,
            trim: true,
            default: 'default.jpg'
        },
        urlPhoto: {
            type: String,
            trim: true,
            default: process.env.URL_USER_IMAGE
        },
        password: {
            type: String,
            trim: true,
            required: [true, 'Please provide a password'],
            select: false
        },

        passwordConfirm: {
            type: String,
            trim: true,
            required: [true, 'Please confirm your password'],
            validate: {
                validator: function(el) {
                    return el === this.password;
                },
                message: "Passwords are no the same"
            }
        },
        passwordChangedAt: Date
    }
);

userSchema.pre('save', async function(next) {
    //only run this function if password was actually modified
    if( !this.isModified('password') ) return next();
    this.password = await bcryptjs.hash(this.password, 12);
    this.passwordConfirm = "undefined";
    next();
});

userSchema.pre('save', async function(next){
    if( !this.isModified('password') || this.isNew ) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (jwtTimeStamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10 );
        return jwtTimeStamp < changedTimestamp;
    };
    return false;
};

//export
const User = mongoose.model("User", userSchema);
module.exports = User;
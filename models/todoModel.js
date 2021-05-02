const mongoose = require('mongoose');
const slugify = require('slugify');
const todoSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            trim: true,
            required: [true, 'Please provide a name' ]
        },

        state: {
            type: String,
            required: [true, 'Please provide a state' ],
            enum: ['completed', 'incomplete', 'delete'],
            default: "incomplete"
        },

        active: {
            type: Boolean,
            default: true
        },

        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        
        createAt: {
            type: Date,
            default: Date.now
        },

        slug: String 
    }
);

todoSchema.pre('save', function(next){
    this.slug = slugify(this.name, { lower: true }); 
    next();
});

todoSchema.pre(/^find/, function(next){
    this.find({ active: { $ne: false } });
    next();
});

const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;
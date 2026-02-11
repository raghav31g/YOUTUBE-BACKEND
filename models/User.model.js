const mongoose = require('mongoose');

// user schema
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
    },
    email: { 
        type: String,
    },
},{
    timestamps: true
});

// user model

const User = mongoose.model('User', userSchema);
module.exports = User;
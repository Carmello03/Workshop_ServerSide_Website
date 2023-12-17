const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Trims whitespace from the email
        lowercase: true, // Converts email to lowercase
        match: [/.+\@.+\..+/, 'Please fill a valid email address'] // Simple email validation
    },
    password: {
        type: String,
        required: true
    },

});

const User = mongoose.model('User', userSchema);

module.exports = User;
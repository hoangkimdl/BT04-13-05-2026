const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    resetCode: String,
    resetCodeExpireAt: Date,
});
const User = mongoose.model('User', userSchema);
module.exports = User;

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        default: ""
    },
    last_name: {
        type: String,
        default: "",
        required: true
    },
    password: {
        type: String,
        required: true,
        default: ""
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        default: "employee"
    },
}, {
    timestamps: true
});
module.exports = mongoose.model('user', userSchema);
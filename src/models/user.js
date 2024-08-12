require('dotenv').config();
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }]
});

let User = mongoose.model('User', UserSchema);

module.exports = User;
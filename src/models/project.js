require('dotenv').config();
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const ProjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task'
    }],
    status: {
        type: String,
        enum: ['Main Inbox', 'Waiting For', 'Scheduled', 'Someday/Maybe'],
        default: 'Main Inbox'
    },
    areaOfResponsibility: {
        type: String
    },
    dueDate: {
        type: Date
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});


const Project = model('Project', ProjectSchema);

module.exports = Project;

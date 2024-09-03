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
        enum: ['Main inbox', 'Waiting For', 'Scheduled', 'Someday/Maybe'],
        default: 'Main inbox'
    },
    areaOfResponsibility: {
        type: String
    },
    dueDate: {
        type: Date
    }
});


const Project = model('Project', ProjectSchema);

module.exports = Project;

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
    },
    priority: {
        type: Number,
        enum: [1, 2, 3, 4, 5], //Highest=1, Lowest=5
        required: true
    }
});


const Project = model('Project', ProjectSchema);

module.exports = Project;

require('dotenv').config();
const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    completed: {
        type: Boolean,
        default: false
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        default: null
    },
    frequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
        default: null
    },
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

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;

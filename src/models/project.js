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
    }]
});

const Project = model('Project', ProjectSchema);

module.exports = Project;
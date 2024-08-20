const Project = require('../models/project');
const Task = require('../models/task');

const createProject = async (req, res) => {
    try {
        const { name, description, tasks } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const newProject = new Project({
            name,
            description,
            tasks: tasks || null
        });


        if (tasks && tasks.length > 0) {
            await Task.updateMany({ _id: { $in: tasks } },
                { $set: { project: newProject._id } }
            );
            newProject.tasks = tasks;
        }

        await newProject.save();

        res.status(201).json({ message: 'Project created', newProject });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('tasks');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();

        if (!projects.size == 0) {
            return res.status(404).json({ error: 'There are no projects' });
        }

        res.status(200).json(projects);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const updateProject = async (req, res) => {
    try {
        const { name, description, tasks } = req.body;
        const projectId = req.params.id;

        const project = await Project.findByIdAndUpdate(projectId, { name, description, tasks }, { new: true });

        if (!project) {
            return res.status(404).json('Project not found');
        }

        res.status(200).json(project);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const deleteProject = async (req, res) => {
    try {
        const projectId = req.params.id;

        const project = await Project.findByIdAndDelete(projectId);

        if (!project) {
            return res.status(404).json('Project not found');
        }

        if (project.tasks) {

            await Task.updateMany({ project: projectId }, { $set: { project: null } })
        }

        res.status(200).json('Project deleted successfully');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = {
    createProject,
    getProjectById,
    getAllProjects,
    updateProject,
    deleteProject
}
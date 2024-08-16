const Task = require('../models/task');
const Project = require('../models/project');

const createTask = async (req, res) => {
    try {
        const { title, description, completed, project: projectId } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required.' });
        }

        const newTask = new Task({
            title,
            description,
            completed,
            project: projectId || null
        });

        await newTask.save();

        if (projectId) {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            if (!Array.isArray(project.tasks)) {
                project.tasks = [];
            }

            project.tasks.push(newTask._id);
            await project.save();
        }

        res.status(201).json({ message: 'Task created', newTask });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        } else {
            return res.json(task);
        }

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();

        if (tasks.size == 0) {
            return res.status(404).json({ error: 'There are no tasks' });
        }

        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

const updateTask = async (req, res) => {
    try {
        const { title, description, completed, project } = req.body;
        const taskId = req.params.id;

        // Fetch the existing task to get its current project
        const existingTask = await Task.findById(taskId);
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task with new details
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { title, description, completed, project },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Handle project updates
        if (existingTask.project && existingTask.project.toString() !== project) {
            // Remove the task from the old project's tasks array
            const oldProject = await Project.findById(existingTask.project);
            if (oldProject) {
                oldProject.tasks.pull(taskId);
                await oldProject.save();
            }
        }

        if (project) {
            // Add the task to the new project's tasks array if it's not already there
            const newProject = await Project.findById(project);
            if (newProject) {
                if (!newProject.tasks.includes(taskId)) {
                    newProject.tasks.push(taskId);
                    await newProject.save();
                }
            }
        }

        res.status(202).json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}



const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.project) {
            const project = await Project.findById(task.project);

            if (project) {
                project.tasks.pull(taskId);
                await project.save();
            }
        }

        await Task.findByIdAndDelete(taskId);

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}



module.exports = {
    createTask,
    getTaskById,
    getAllTasks,
    updateTask,
    deleteTask
};
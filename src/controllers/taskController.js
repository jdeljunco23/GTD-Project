const Task = require('../models/task');
const Project = require('../models/project');

const createTask = async (req, res) => {
    try {
        const { title, description, completed, project: projectId, frequency, status, areaOfResponsibility, dueDate, priority } = req.body;

        const userId = req.user._id;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required.' });
        }

        const existingTaskName = await Task.findOne({ title });
        if (existingTaskName) {
            return res.status(409).json({ message: 'This title is already taken' });
        }

        if (projectId) {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Validate that task dueDate is before or equal to project dueDate
            if (dueDate && new Date(dueDate) > new Date(project.dueDate)) {
                return res.status(400).json({ error: 'Task due date cannot be later than project due date.' });
            }

            // If the task is in a project, the task's area of responsibility and status will be the same as the project's
            newTask.areaOfResponsibility = project.areaOfResponsibility;
            newTask.status = project.status;

            if (!Array.isArray(project.tasks)) {
                project.tasks = [];
            }

            project.tasks.push(newTask._id);
            await project.save();
        }

        const newTask = new Task({
            title,
            description,
            completed,
            project: projectId || null,
            frequency: frequency || null,
            status: status || 'Main Inbox',
            areaOfResponsibility: areaOfResponsibility || null,
            dueDate: dueDate || null,
            priority: priority,
            user: userId
        });

        await newTask.save();

        res.status(201).json({ message: 'Task created', newTask });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const getTaskById = async (req, res) => {
    try {
        const userId = req.user._id;
        const task = await Task.findOne({ _id: req.params.id, user: userId });

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
        const userId = req.user._id;
        const tasks = await Task.find({ user: userId });

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
        const userId = req.user._id;
        const { title, description, completed, project: projectId, frequency, status, areaOfResponsibility, dueDate, priority } = req.body;
        const taskId = req.params.id;

        // Find the existing task
        const existingTask = await Task.findOne({ _id: taskId, user: userId });
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Check for title uniqueness
        const existingTaskName = await Task.findOne({ title });
        if (existingTaskName && existingTaskName._id.toString() !== taskId) {
            return res.status(409).json({ message: 'This title is already taken' });
        }

        // Default values
        let updatedAreaOfResponsibility = areaOfResponsibility !== undefined ? areaOfResponsibility : existingTask.areaOfResponsibility;
        let updatedStatus = status !== undefined ? status : existingTask.status;

        // Handle project updates
        if (projectId && (!existingTask.project || existingTask.project.toString() !== projectId)) {
            const newProject = await Project.findById(projectId);
            if (!newProject) {
                return res.status(404).json({ error: 'New project not found' });
            }

            // Validate dueDate
            if (dueDate && new Date(dueDate) > new Date(newProject.dueDate)) {
                return res.status(400).json({ error: 'Task due date cannot be later than project due date.' });
            }

            // Update based on new project
            updatedAreaOfResponsibility = newProject.areaOfResponsibility;
            updatedStatus = newProject.status;
        } else if (!projectId && existingTask.project) {
            // If no project ID is provided and the task was previously associated with a project
            updatedStatus = 'Main Inbox';
            updatedAreaOfResponsibility = null;
        }

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                title,
                description,
                completed,
                project: projectId || null, // Set to null if projectId is not provided
                frequency,
                status: updatedStatus, // Use updatedStatus here
                areaOfResponsibility: updatedAreaOfResponsibility, // Use updatedAreaOfResponsibility here
                dueDate,
                priority,
                user: userId
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Handle old project disassociation
        if (existingTask.project && existingTask.project.toString() !== projectId) {
            const oldProject = await Project.findById(existingTask.project);
            if (oldProject) {
                oldProject.tasks.pull(taskId);
                await oldProject.save();
            }
        }

        // Handle new project association
        if (projectId) {
            const newProject = await Project.findById(projectId);
            if (newProject && !newProject.tasks.includes(taskId)) {
                newProject.tasks.push(taskId);
                await newProject.save();
            }
        }

        res.status(202).json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


const deleteTask = async (req, res) => {
    try {
        const userId = req.user._id;
        const taskId = req.params.id;
        const task = await Task.findOne({ _id: taskId, user: userId });

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
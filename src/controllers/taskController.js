const Task = require('../models/task');
const Project = require('../models/project');

const createTask = async (req, res) => {
    try {
        const { title, description, completed, project: projectId, frequency, status, areaOfResponsibility, dueDate, priority } = req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required.' });
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
            priority: priority
        });

        await newTask.save();

        if (projectId) {
            const project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Validate that task dueDate is before or equal to project dueDate
            if (dueDate && new Date(dueDate) > new Date(project.dueDate)) {
                return res.status(400).json({ error: 'Task due date cannot be later than project due date.' });
            }

            // If the task is in a project, the task's area of responsibility will be the same as the project's
            newTask.areaOfResponsibility = project.areaOfResponsibility;

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
        const { title, description, completed, project, frequency, status, areaOfResponsibility, dueDate, priority } = req.body;
        const taskId = req.params.id;

        const existingTask = await Task.findById(taskId);
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        let updatedAreaOfResponsibility = areaOfResponsibility || existingTask.areaOfResponsibility;

        if (project && project !== existingTask.project.toString()) {
            const newProject = await Project.findById(project);
            if (!newProject) {
                return res.status(404).json({ error: 'New project not found' });
            }

            // Validate that task dueDate is before or equal to new project's dueDate
            if (dueDate && new Date(dueDate) > new Date(newProject.dueDate)) {
                return res.status(400).json({ error: 'Task due date cannot be later than project due date.' });
            }

            updatedAreaOfResponsibility = newProject.areaOfResponsibility;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                title,
                description,
                completed,
                project,
                frequency,
                status,
                areaOfResponsibility: updatedAreaOfResponsibility,
                dueDate,
                priority
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (existingTask.project && existingTask.project.toString() !== project) {
            const oldProject = await Project.findById(existingTask.project);
            if (oldProject) {
                oldProject.tasks.pull(taskId);
                await oldProject.save();
            }

            if (project) {
                const newProject = await Project.findById(project);
                if (newProject && !newProject.tasks.includes(taskId)) {
                    newProject.tasks.push(taskId);
                    await newProject.save();
                }
            }
        }

        res.status(202).json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};



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
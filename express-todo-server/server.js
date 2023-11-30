const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

let tasks = [];

const loadTasks = async () => {
  try {
    const data = await fs.readFile('../db.json', 'utf-8');
    tasks = JSON.parse(data).tasks || [];
  } catch (error) {
    console.error('Error loading tasks: ', error);
  }
};

const saveTasks = async () => {
  try {
    await fs.writeFile('../db.json', JSON.stringify({ tasks }, null, 2));
  } catch (error) {
    console.error('Error saving tasks: ', error);
  }
};

loadTasks().then(() => {
  app.get('/api/tasks', (req, res) => {
    res.json(tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { title, description, status } = req.body;

    if (!title || !description || !status) {
      res
        .status(400)
        .json({ message: 'Please provide title, description, and status' });
    } else {
      const newTask = {
        id: tasks.length + 1,
        title,
        description,
        status,
      };
      tasks.push(newTask);
      saveTasks().then(() => {
        res.json(newTask);
      });
    }
  });

  app.patch('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const taskIndex = tasks.findIndex((task) => task.id === parseInt(id, 10));
    if (taskIndex !== -1) {
      tasks[taskIndex].status = status;
      saveTasks().then(() => {
        res.json(tasks[taskIndex]);
      });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;

    tasks = tasks.filter((task) => task.id !== parseInt(id, 10));
    saveTasks().then(() => {
      res.json({ message: 'Task deleted successfully' });
    });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});

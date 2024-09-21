const express = require('express');
const fs = require('fs').promises;
const app = express();

let tasks = [];
const TASKS_FILE = 'tasks.json';

async function loadTasks() {
  try {
    const fileContent = await fs.readFile(TASKS_FILE, 'utf8');
    console.log('File content:', fileContent);
    if (fileContent.trim() === '') {
      console.log('Tasks file is empty. Initializing with an empty array.');
      tasks = [];
    } else {
      tasks = JSON.parse(fileContent);
      console.log('Loaded tasks:', tasks);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Tasks file does not exist. Will create on first add.');
      tasks = [];
    } else {
      console.error('Error reading tasks file:', error);
      tasks = [];
    }
  }
}

app.use(express.json());

app.use(async (req, res, next) => {
  await loadTasks();
  next();
});

app.get("/show-all-tasks", (req, res) => {
  const result = tasks.map(task => task.taskName);
  res.json(result);
});

app.get("/show-completed-tasks", (req, res) => {
  const result = tasks.filter(task => task.completed === 1).map(task => task.taskName);
  res.json(result);
});

app.get("/show-uncompleted-tasks", (req, res) => {
  const result = tasks.filter(task => task.completed === 0).map(task => task.taskName);
  res.json(result);
});

app.post("/create-task", async (req, res) => {
  const { taskName } = req.body;
  if(tasks.find(task => task.taskName === taskName))
    return res.json({error: "Already exists."})
  if (!taskName) {
    return res.status(400).json({ error: "Task name is required" });
  }
  const task = { 
    taskName: taskName,
    completed: 0
  };
  tasks.push(task);
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks));
  res.json({ message: "Task created successfully" });
});

app.put("/modify-task/taskName", async (req, res) => {
  const { oldName, newName } = req.body;
  if (!oldName || !newName) {
    return res.status(400).json({ error: "Both oldName and newName are required" });
  }
  const task = tasks.find(task => task.taskName === oldName);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  task.taskName = newName;
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks));
  res.json({ message: "Task updated successfully" });
});

app.put("/modify-task/taskStatus", async (req, res) => {
  const { taskName } = req.body;
  if (!taskName) {
    return res.status(400).json({ error: "Task name is required" });
  }
  const task = tasks.find(task => task.taskName === taskName);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  if (task.completed === 0) {
    task.completed = 1;
    await fs.writeFile(TASKS_FILE, JSON.stringify(tasks));
    res.json({ message: "Task updated successfully" });
  } else {
    res.json({ message: "Task is already completed" });
  }
});

app.delete("/delete-task", async (req, res) => {
  const { taskName } = req.body;
  if (!taskName) {
    return res.status(400).json({ error: "Task name is required" });
  }
  const index = tasks.findIndex(task => task.taskName === taskName);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  tasks.splice(index, 1);
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks));
  res.json({ message: "Task deleted successfully" });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
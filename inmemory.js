const express = require("express");

const app = express();
const tasks = []

app.get("/show-all-tasks",function(req, res){
    const result = []
    for(let i of tasks){
        result.push(i.taskName)
    }
    res.send(result);
})

app.get("/show-completed-tasks",function(req, res){
    const result = []
    for(let i of tasks){
        if(i.completed === 1)
        result.push(i.taskName)
    }
    res.send(result);
})

app.get("/show-uncompleted-tasks",function(req, res){
    const result = []
    for(let i of tasks){
        if(i.completed === 0)
        result.push(i.taskName)
    }
    res.send(result);
})

app.post("/create-task",(req, res) => {
    let taskName = req.query.taskName;
    const task = { 
        taskName :  taskName ,
        completed : 0
    };
    tasks.push(task);
    res.send("Task created successfully");
})

app.put("/modify-task/taskName",(req, res) => {
    let oldTaskName = req.query.oldName;
    let newTaskName = req.query.newName;
    tasks.forEach((task) => {
        if(task.taskName == oldTaskName){
            task.taskName = newTaskName
        }
    })
    res.send("Task updated successfully");
})

app.put("/modify-task/taskStatus",(req, res) => {
    let taskName = req.query.taskName;
    tasks.forEach((task) => {
        if(task.taskName == taskName && task.completed === 0){
            task.completed = 1
        }
    })
    res.send("Task updated successfully");
})

app.delete("/delete-task",(req, res) => {
    let idx = 0;
    let taskName = req.query.taskName;
    tasks.forEach((task,index) => {
        if(task.taskName == taskName)
            idx = index;
    })
    tasks.splice(idx, 1)
    res.send("Task deleted successfully");
})

app.listen(3000);

const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const cors=require("cors");

const app = express();
app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, "tasks.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Gives all responses
app.get("/tasks/", async (request, response) => {
    const getTasksArray = `
      SELECT
        *
      FROM
        tasks;`;
    const tasksArray = await db.all(getTasksArray);
    response.send(tasksArray);
});

// Gives specified response
app.get("/tasks/:taskId/",async(request,response)=>{
    const {taskId}=request.params
    const getTaskValue=`
    SELECT * FROM tasks WHERE task_id=${taskId};
    `
    const taskValue=await db.get(getTaskValue);
    response.send(taskValue)
})

// Adding a task
app.post("/tasks/",async(request,response)=>{
    const taskDetails=request.body;
    const {taskId,taskName,taskDescription}=taskDetails;
    const addTaskQuery=`INSERT INTO tasks (task_id,tasks_name,tasks_description) VALUES (${taskId},'${taskName}','${taskDescription}')`
    const addTask=await db.run(addTaskQuery)
    response.send(addTask)
})

// Updating a task
app.put("/tasks/:taskId/",async(request,response)=>{
    const {taskId}=request.params
    const taskDetails=request.body 
    const {taskName,taskDescription}=taskDetails
    const dbQuery=`UPDATE tasks SET tasks_name='${taskName}',tasks_description='${taskDescription}' WHERE task_id=${taskId};`
    await db.run(dbQuery);
    response.send("Task updated successfully");
})

// Deleting a task
app.delete("/tasks/:taskId",async(request,response)=>{
    const {taskId}=request.params 
    const dbQuery=`DELETE FROM tasks WHERE task_id=${taskId};`
    await db.run(dbQuery);
    response.send("Task Deleted Successfully");
})
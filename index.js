import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

const taskSchema = new mongoose.Schema({
    name: String
});

const workTaskModel = mongoose.model("work", taskSchema);
const todayTaskModel = mongoose.model("today", taskSchema);


const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

var todayTask = [];
var workTask = [];

var todayTaskListen = true;

app.use(express.static("public"));

app.get("/",async (req,res) => {
    todayTaskListen = true;
    onGetExitPoint(req,res);
});

app.get("/today", async(req, res) => {
    todayTaskListen = true;
    onGetExitPoint(req,res);
});

app.get("/work", async (req, res) => {
    console.log("GET: Work");
    todayTaskListen = false;
    onGetExitPoint(req,res);
});

app.post("/submit", (req,res) => {
    var newTask = req.body["task"];
    var currentTask;

    if(todayTaskListen){
        const t = new todayTaskModel({
            name: newTask
        });

        t.save();
    } 
    else{
        const w = new workTaskModel({
            name: newTask
        });

        w.save();
    }
    
    var dateInfo = generateDayInfo();

    dateInfo = {
        dayOfTheWeek: dateInfo.dayOfTheWeek,
        month: dateInfo.month,
        dayMonth: dateInfo.dayMonth,
        tasks: currentTask
    };

    if(todayTaskListen){
        res.redirect("/");
    } else{
        res.redirect("/work");
    }
});

app.listen(process.env.PORT || port, () => {
    console.log(`Listening to port ${port}`);
})

function generateDayInfo()
{
    const date = new Date();
    const day = days[date.getDay()];
    const currentMonth = month[date.getMonth()];
    const dayOfMonth = date.getDate();

    return {dayOfTheWeek: day, month: currentMonth, dayMonth: dayOfMonth};
}

async function onGetExitPoint(req, res) {

    var dateInfo = generateDayInfo();
    var currentTask = await getAllCollectionFromDatabase();

    console.log(currentTask);

    dateInfo = {
        dayOfTheWeek: dateInfo.dayOfTheWeek,
        month: dateInfo.month,
        dayMonth: dateInfo.dayMonth,
        tasks: currentTask
    };

    res.render("index.ejs", dateInfo);
}

async function getAllCollectionFromDatabase(){
    var modelFind = todayTaskListen? todayTaskModel : workTaskModel;

    try{
        const result = await modelFind.find({});
        
        return result;
    }
    catch(err) {
        console.log(err);
        return [];
    }
}

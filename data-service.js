var ToDoList = new Array();
var DoneList = new Array();
var fs = require('fs');

const Sequelize = require('sequelize');
var sequelize = new Sequelize('dc4v31vvi4hcdn','kbpehfwtapmzoz','0c46c7c31aeca1defabe932df1f2318e93f679ff08de7180c76b8d47e15f3388',{
    host:'ec2-184-73-209-230.compute-1.amazonaws.com',
    dialect:'postgres',
    port: 5432,
    dialectOptions:{
        ssl: true
    }
});
var exports = module.exports = {};

const ToDoList = sequelize.define('ToDoList', {
    Listnum: {
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    Listname:Sequelize.STRING,
    Description:Sequelize.STRING
});

const DoneList = sequelize.define('DoneList',{
    Donenum:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    DoneName: Sequelize.STRING,
    Description: Sequelize.STRING
});

exports.initialize = function() {
    
    return new Promise((resolve, reject) => {
        sequelize.sync()
        .then(() => resolve())
        .catch(() => reject("unable to sync the database"));
    });
        
        
        
        /*fs.readFile('data/ToDoList.json', 'utf-8', (err, data) => {
            if(err){
                reject(new Error("Fail To init DO List file"));
            }
            else{
                ToDoList = JSON.parse(data);
            }
        })

        fs.readFile('data/DoneList.json', 'utf-8', (err, data) => {
            if(err) {
                reject(new Error("Fail to init Done List file"));
            }
            else {
                DoneList = JSON.parse(data);
            }
        })

        resolve("Successful Init");
    })
    */
};

exports.getAllToDoList = function(){
    return new Promise((resolve, reject) => {
        ToDoList.findAll()
        .then(()=>resolve(ToDoList.findAll()))
        .catch(()=>reject("No To Do List returned"))
    });
};


exports.getAllDoneList = function(){
    return new Promise((resolve, reject) => {
        DoneList.findAll()
        .then(()=>resolve(DoneList.findAll()))
        .catch(()=>reject("No DoneList returned"))
    });
};  

exports.addToDoList = function(ToDoListData) {
    ToDoList.push(ToDoListData);
    return new Promise(function(resolve, reject) {
        if (ToDoList.length != 0) {
            resolve(ToDoList);    
        }
        else {
            reject("no results returned");
        }
    })
};
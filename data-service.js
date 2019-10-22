var ToDoList = new Array();
var DoneList = new Array();

var fs = require('fs');
var exports = module.exports = {};

exports.initialize = function() {
    
    return new Promise((resolve, reject) => {
        fs.readFile('data/ToDoList.json', 'utf-8', (err, data) => {
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
};

exports.getAllToDoList = function(){
    return new Promise((resolve, reject) => {
        if(ToDoList.length != 0) {
            resolve(ToDoList);
    }
        else {        
            reject("No To Do List returned");
    }
    });
};


exports.getAllDoneList = function(){
    return new Promise((resolve, reject) => {
        if (DoneList.length == 0)
        reject("No DoneList returned");
        else
        resolve(DoneList);
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
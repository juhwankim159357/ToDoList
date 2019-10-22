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
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            for (let x in ToDoListData) {
                if(ToDoListData[x] == ""){
                    ToDoListData[x] = null;
                }
            }
            resolve(ToDoList.create({
                Listnum: ToDoListData.Listnum,
                Listname: ToDoListData.Listname,
                Description: ToDoListData.Description,
                }));
            }).catch(() => {
                reject("unable to create To Do List.");
            });
        }).catch(() => {
            reject("unable to create To Do List.");
    });
};
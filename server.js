var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");;
var app = express();
var dataService = require('./data-service.js');
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');

app.use(bodyParser.urlencoded({extend: true}));

app.use(express.static('public')); 

app.engine('.hbs',exphbs({
    extname:'.hbs', 
    defaultLayout:'main',
    helpers:{
        navLink:function(url, options){
            return '<li' + ((url==app.locals.activeRoute)? ' class="active"':'')
                +'><a href="'+url+'">'+options.fn(this)+'</a></li>'
        },
        equal:function(lvalue, rvalue, options){
            if(arguments.length<3)
                throw new Error("Handlerbars Helper equal needs 2 parameters");
            if(lvalue != rvalue){
                return options.inverse(this);
            }else{
                return options.fn(this);
            }
        }
    }
}));

app.set('view engine','.hbs');

app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});

app.get("/", (req, res) => {
    res.render("home");
});

app.get('/ToDoList', (req, res) => {
    dataService.getAllToDoList()
    .then((data) => {
        if (data.length > 0) { res.render("ToDoList", {ToDoList:data}) 
        }
        else{
            res.render("ToDoList", {message: "NO TO DO LIST"})
        }
    })
    .catch(() => res.render("ToDoList", {message: "error on dataservice"}))
});

app.get('/DoneList', (req, res) => {
    dataService.getAllDoneList()
        .then((data) => res.json(data))
        .catch((err) => res.json({"message": err}))
});

app.get('/ToDoList/add', (req, res) => {
    res.render("addToDoList");
});

app.get('/ToDoList/delete/:ListNum', (req, res) => {
    dataService.deleteListByNum(req.params.ListNum)
    .then((data)=> res.redirect('/ToDoList'))
    .catch(() => res.status(500).send("Unable to remove list / THERE IS NO LIST"))
});

app.get('*', (req, res) => {
    //res.send("Page Not Found");
    res.status(404);
    res.redirect("https://cdn-images-1.medium.com/max/1600/1*9APgHrP6f5sEfZJesaZlrg.png");
});

app.post('/ToDoList/add', function(req, res){
    dataService.addToDoList(req.body)
    .then(res.redirect('/ToDoList'))
    .catch(function (err) {
        res.json({'message': err})
    })
});


// setup http server to listen on HTTP_PORT
dataService.initialize()
.then(() => {
    app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
})
.catch(() => {
    console.log("There was an error initializing");
})


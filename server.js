var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");;
var app = express();
var clientSessions = require("client-sessions");
var dataService = require('./data-service.js');
var dataServiceAuth = require('./data-service-auth.js');
var bodyParser = require("body-parser");
var exphbs = require('express-handlebars');

app.use(bodyParser.urlencoded({extend: true}));

app.use(express.static('public')); 

app.use(clientSessions({
    cookieName: "session", 
    secret: "web322_a6",
    duration: 3 * 60 * 1000, // 3minutes
    activeDuration: 5* 1000 * 60 
}));

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});  

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
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});



app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
    res.render('userHistory');
});

app.post('/login', (req, res) => {
    req.body.userAgent = req.get('User-Agent');

    dataServiceAuth.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/employees');
    }).catch((err) => {
        res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});

app.post('/register', (req, res) => {
    dataServiceAuth.registerUser(req.body)
    .then((value) => {
        res.render('register', {successMessage: "User created"});
    }).catch((err) => {
        res.render('register', {errorMessage: err, userName: req.body.userName});
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


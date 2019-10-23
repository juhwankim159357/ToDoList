var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName":{
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime":Date,
        "userAgent":String
    }]
});

var User; // to be defined on new connection (see initialize)

module.exports.initialize = function(){
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection("mongodb+srv://Juhwankim_admin:159357@cluster0-ejeyc.mongodb.net/auth?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("Users", userSchema);
           resolve();
        });
    });
}

module.exports.registerUser = function (userData){
    return new Promise(function (resolve, reject) {
        if( userData.password != userData.password2 ){
            reject ("Passwords do not match");
        }
        else{        
            var newUser = new User(userData);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err){
                        reject("There was an error encrypting the password");
                    }
                    else{
                        newUser.password = hash;
                        newUser.save()
                        .then(()=>{
                            resolve();
                        })
                        .catch( (err)=>{
                            if (err.code == 11000){
                                reject("User Name already taken");                 
                            }
                            else{
                                reject("There was an error creating the user: err"+err);
                            }
                        }); 
                    }
                });
            });

        }
    });
}

module.exports.checkUser = function (userData){
    return new Promise(function (resolve, reject){
        User.find({userName: userData.userName})
        .exec()
        .then((finded_user)=>{
            bcrypt.compare(userData.password, finded_user[0].password )
            .then((res) => {
                finded_user[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.update({ userName: finded_user[0].userName},
                            { $set: { loginHistory: finded_user[0].loginHistory } },
                            { multi: false })
                .exec()
                .then( ()=>{
                    resolve(finded_user[0]);
                })
                .catch((err)=>{
                    reject("There was an error verifying the user: " + err);
                });
            })
            .catch((err)=>{
                reject("Incorrect Password for user: " + userData.userName);
            })  
        })
        .catch((err)=>{
            reject("Unable to find user: " + userData.userName);
        });
    });
}
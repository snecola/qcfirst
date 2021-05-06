var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bcrypt = require("bcrypt");
var path = require('path');

var app = express();

app.use(session({
    secret: 'Secret to be revisited and changed later for encryption',
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/docs')));

var mysqlConfig = {
    host     : 'remotemysql.com',
    port     : '3306',
    user     : 'MrMXroQJyp',
    password : 'mtEttXJXFE',
    database : 'MrMXroQJyp'
}

var connection;
function connectToDB (){
    // Create connection to DB
    connection = mysql.createConnection(mysqlConfig);
    // Connect to db
    connection.connect((error)=>{
        if (error) {
            console.error(`Could not connect to DB`, err);
            setTimeout(connectToDB, 3000);
        }
    });
    console.log("Successfully connected to DB");
    // Deal with errors on connection
    connection.on('error', (error)=>{
        console.log("DB Err:", error);
        if(error.code === 'PROTOCOL_CONNECTION_LOST') {
            connectToDB();
        } else {
            console.log("Connection Error", error)
            throw error;
        }
    })
}
connectToDB();

app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname + "/docs/index.html"))
})

app.post("/login", (req, res) => {
    var loginEmail = req.body.email;
    var loginPassword = req.body.password;
    if (loginEmail && loginPassword) {
        connection.query('SELECT * FROM accounts WHERE email = ? AND password = ?', [loginEmail, loginPassword])
    }
})

async function generatePass (pass) {
    const saltRounds = 10;
    var returnPass;
    var salt = await bcrypt.genSalt(saltRounds, (err, salt)=>{
        var hashedPass = bcrypt.hash(pass, salt, (err, hash)=>{
            returnPass = hash;
        });
    });
    return returnPass;
}

app.post("/register", (req, res) =>{
    var regEmail = req.body.email;
    var regPassword = req.body.password;
    var regFirstName = req.body.fName;
    var regLastName = req.body.lName;
    var accType = req.body.accType;
    console.log(regEmail, regPassword, regFirstName, regLastName, accType);

    if (regEmail) {
        connection.query('SELECT * FROM accounts WHERE email = ?', [regEmail], (error, results, fields) => {
            if (results.length > 0) {
                console.error("Email already registered");
                res.redirect('/signup-failed')
            } else {
                connection.query('INSERT INTO accounts (`email`, `password`, `FirstName`, `LastName`, `accountType`) VALUES (?, ?, ?, ?, ?)', [regEmail, regPassword, regFirstName, regLastName, accType], (error, results, fields) =>{
                    if (error) {
                        console.error('Error at insertion')
                        res.end();
                    }
                    console.info(`Registered ${regEmail} successfully`);
                })
                res.redirect("/signup-success")
            }

        })
    } else {
        res.send('Invalid email');
        connection.on('error', function(err) {
            console.log("[mysql error]",err);
            res.end();
        });
    }

})

app.get("/signup-failed", (req, res)=>{
    console.log("/signup failed");
    res.sendFile(path.join(__dirname + "/docs/signup-failed.html"))
})

app.get("/signup-success", (req, res)=>{
    console.log("/signup success");
    res.sendFile(path.join(__dirname + "/docs/index.html"))
})

app.listen(3000);
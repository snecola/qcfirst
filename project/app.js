require('dotenv').config({ path: 'process.env' })
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bcrypt = require("bcrypt");
var path = require('path');

var app = express();

app.use(session({
    secret: 'Secret to be revisited and changed later for encryption',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/docs')));

// CONFIG TO BE REMOVED AND HIDDEN
var mysqlConfig = {
    host     : process.env.MYSQL_HOST,
    port     : process.env.MYSQL_PORT,
    user     : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASS,
    database : process.env.MYSQL_DB
}

// CONNECT TO USER DATABASE
var connection;
function connectToDB (){
    // Create connection to DB
    connection = mysql.createConnection(mysqlConfig);
    // Connect to db
    connection.connect((error)=>{
        if (error) {
            console.error(`Could not connect to DB`, error);
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

// INDEX LANDING PAGE
app.get("/", (req, res)=>{
    res.sendFile(path.join(__dirname + "/docs/index.html"))
})

// LOGIN HANDLER
app.post("/login", async function (req, res) {
    var loginEmail = req.body.email;
    var loginPassword = req.body.password;

    connection.query('SELECT * FROM accounts WHERE email = ?', [loginEmail], async function (error, results, fields) {
        if (results.length>0){
            var validPass = await bcrypt.compare(loginPassword, results[0].password)
            var accType = results[0].accountType;
            var fullName = results[0].FirstName + " " + results[0].LastName;
            if (validPass) {
                console.log(results[0].accountType);

                // START EXPRESS SESSION
                req.session.loggedin = true;
                req.session.userEmail = loginEmail;
                req.session.accountType = accType;
                req.session.fullName = fullName;
                console.log("Session started", req.sessionID, req.session.loggedin, req.session.userEmail, req.session.accountType);

                // SEE WHICH DASH TO REDIRECT THEM TO
                if(accType === 'S'){
                    res.redirect("/student-dashboard");
                }
                if(accType === 'T'){
                    res.redirect("/instructor-dashboard");
                }
            } else {
                res.redirect("/login-failed")
            }
        } else {
            res.redirect("/login-failed")
        }
        res.end();
    })
})

//GENERATE HASHED PASSWORD USING BCRYPT
async function generatePass (pass) {
    const saltRounds = 10;
    var salt = await bcrypt.genSalt(saltRounds)
    var hashedPass = await bcrypt.hash(pass, salt)
    return hashedPass;
}

//REGISTER HANDLER
app.post("/register", async function (req, res) {
    var regEmail = req.body.email;
    var regPassword = await generatePass(req.body.password);
    var regFirstName = req.body.fName;
    var regLastName = req.body.lName;
    var accType = req.body.accType;
    console.log(regEmail, regPassword, regFirstName, regLastName, accType);

    var regStatus = 0;
    if (regEmail) {
        connection.query('SELECT * FROM accounts WHERE email = ?', [regEmail], (error, results, fields) => {
            if (results.length > 0) {
                console.error("Email already registered");
                res.redirect('/signup-failed')
            } else {
                connection.query('INSERT INTO accounts (`email`, `password`, `FirstName`, `LastName`, `accountType`) VALUES (?, ?, ?, ?, ?)', [regEmail, regPassword, regFirstName, regLastName, accType], function (error, results, fields) {
                    if (error) {
                        console.error('Error at insertion')
                        regStatus = 500;
                        res.end()
                    } else {
                        console.info(`Registered ${regEmail} successfully`);
                        regStatus = 200;
                    }
                    if (regStatus === 500) {
                        res.redirect("/signup-failed");
                    }else if (regStatus === 200) {
                        res.redirect("/signup-success");
                    }
                })
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

//SIGNUP FAILED RESPONSE
app.get("/signup-failed", (req, res)=>{
    console.log("/signup failed");
    res.sendFile(path.join(__dirname + "/docs/signup-failed.html"))
})

//SIGNUP SUCCESS RESPONSE
app.get("/signup-success", (req, res)=>{
    console.log("/signup success");
    res.sendFile(path.join(__dirname + "/docs/index.html"))
})

//STUDENT LOGIN RESPONSE
app.get("/student-dashboard", (req, res)=>{
    console.log("/student-dashboard success");
    if (req.session.loggedin === false || req.session.accountType !== 'S') {
        console.log("Unauthorized attempt to access Student Dashboard")
        res.redirect('/index.html');
    } else {
        res.sendFile(path.join(__dirname + "/docs/student-dashboard.html"));
    }

})

//INSTRUCTOR LOGIN RESPONSE
app.get("/instructor-dashboard", (req, res)=>{
    console.log("/instructor-dashboard success");
    if (req.session.loggedin === false || req.session.accountType !== 'T') {
        console.log("Unauthorized attempt to access Instructor Dashboard")
        res.redirect('/index.html');
    } else {
        res.sendFile(path.join(__dirname + "/docs/instructor-dash.html"));
    }
})

//LOGIN FAILED RESPONSE
app.get("/login-failed", (req, res)=>{
    console.log("/login failed");
    res.sendFile(path.join(__dirname + "/docs/login-failed.html"));
})

//FORGOT PASS LANDING
app.post("/forgotpass", (req, res)=>{
    console.log("/forgotpass");
    var email = req.body.email;

    connection.query('SELECT * FROM accounts WHERE email = ?', [email], (error, results, fields)=>{
        if (results.length>0){
            res.redirect("/forgotpass-sent")
        } else {
            res.redirect("/forgotpass-failed")
        }
        res.end();
    })
})

//FORGOT PASS RESPONSES
app.get("/forgotpass-sent", (req, res) => {
    console.log("/forgotpass sent");
    res.sendFile(path.join(__dirname + "/docs/forgotpassword-sent.html"));
})
app.get("/forgotpass-failed", (req, res) => {
    console.log("/forgotpass failed");
    res.sendFile(path.join(__dirname + "/docs/forgotpassword-failed.html"));
})

//LOG OUT RESPONSE
app.post("/logout", (req, res) => {
    if (req.session) {
        req.session.loggedin= false;
        req.session.userEmail = null;
        req.session.accountType = null;
        req.session.fullName = null;
        console.log("Logged out", req.session.loggedin, req.session.userEmail, req.session.accountType)
    } else {
        console.log("Failed to find session");
    }
})

//SESSION INFO
app.get("/sessionInfo", async function (req,res) {
    if (req.session){
        var sessionInfo = {
            accountType : req.session.accountType,
            userEmail : req.session.userEmail,
            fullName : req.session.fullName
        }
        console.log(sessionInfo);
        console.log(res.end(JSON.stringify(sessionInfo)));
    } else {
        res.send(500).json({error:"Session not found"});
    }
})

app.get("/instructorDash-update", async function (req, res){
    //TO-DO ADD QUERY TO GATHER ALL CLASSES MATCHING INSTRUCTOR EMAIL FROM DATABASE

})




app.listen(3000);
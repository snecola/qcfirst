require('dotenv').config({ path: 'process.env' })
var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var bcrypt = require("bcrypt");
var path = require('path');
var querystring = require('querystring');

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

//SESSION INFO - MAKE SURE THE USER IS AUTHORIZED
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

// GET ALL COURSES FOR A SPECIFIC INSTRUCTOR
app.get("/getInstructorCourses", async function (req, res){
    connection.query('SELECT * FROM class WHERE InstructorEmail = ?', [req.session.userEmail], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.send(results);
            res.end();
        }
        res.end();
    })
})

// RETRIEVE GENERAL INFORMATION FOR A GIVEN CLASS
app.get("/courseInfo", async function (req, res) {

    let courseId = req.query.courseId;
    console.log("CourseId info requested", courseId);

    connection.query('SELECT * FROM class WHERE ClassId = ?', [courseId], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.send(results);
            res.end();
        }
        res.end();
    })
})

// RETRIEVE LIST OF STUDENTS FOR A GIVEN COURSE
app.get("/courseStudentList", async function (req, res) {
    let courseId = req.query.courseId;
    console.log("CourseId info requested", courseId);

    const query = 'SELECT StudentEmail, ClassId, A.FirstName, A.LastName, A.AccountType, A.Id as StudentId \n' +
        'FROM student as S INNER JOIN accounts as A on S.StudentEmail = A.email WHERE ClassId = ?';

    connection.query(query, [courseId], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.send(results);
            res.end();
        }
        res.end();
    })
})

// GET STUDENT'S ENROLLED COURSES
app.get("/getStudentCourses", async function(req, res) {
    var query = "SELECT * FROM class AS C inner join student AS S on S.ClassId = C.ClassId WHERE S.StudentEmail = ?"

    connection.query(query, [req.session.userEmail], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.send(results);
            res.end();
        }
        res.end();
    })
})

//CREATE NEW COURSE
app.post("/createCourse", function (req, res) {

    var classNum = req.body.courseNum;
    var depName = req.body.courseDepartment;
    var depAcc = req.body.departmentAcc;
    var semester = req.body.semester;
    var description = req.body.description;
    var capacity = req.body.capacity;
    var mon = req.body.monday;
    var tue = req.body.tuesday;
    var wed = req.body.wednesday;
    var thu = req.body.thursday;
    var fri = req.body.friday;
    var sat = req.body.saturday;
    var sun = req.body.sunday;
    var weekdays = "";
    if (mon) weekdays+='M, ';
    if (tue) weekdays+='T, ';
    if (wed) weekdays+='W, ';
    if (thu) weekdays+='TH, ';
    if (fri) weekdays+='F, ';
    if (sat) weekdays+='S, ';
    if (sun) weekdays+='SU, ';
    weekdays = weekdays.slice(0, weekdays.length-2);
    var startTime = req.body.startTime;
    var endTime = req.body.endTime;
    var enrollmentDeadline = req.body.enrollmentDeadline;

    //console.log(classNum, depName, depAcc, semester, description, capacity, weekdays, time);

    var query =`INSERT INTO \`class\`
                (\`DepartmentName\`,
                \`DepartmentAcc\`,
                \`ClassNumber\`,
                \`InstructorEmail\`,
                \`InstructorName\`,
                \`Semester\`,
                \`Description\`,
                \`CountEnrolled\`,
                \`CountCapacity\`,
                \`ScheduleDays\`,
                \`StartTime\`,
                \`EndTime\`,
                \`EnrollmentDeadline\`)
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`

    connection.query(query, [depName, depAcc, classNum, req.session.userEmail, req.session.fullName, semester, description, 0, capacity, weekdays, startTime, endTime, enrollmentDeadline], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.end();
        }
        res.end();
    })
    res.sendFile(path.join(__dirname + "/docs/instructor-dash.html"))
})

//DELETE COURSE FUNCTIONALITY FOR INSTRUCTORS
app.get("/deleteCourse", function (req, res) {
    let courseId = req.query.courseId;
    console.log("Delete course id:", courseId);

    var query = 'DELETE FROM class WHERE ClassId = ?';
    connection.query(query, [courseId], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.end();
        }
        res.end();
    })
})

//ENROLL IN COURSE BUTTON
app.post("/enrollInCourse", async function (req, res) {
    let courseId = req.query.courseId;

    var query = 'INSERT INTO student (`StudentEmail`,`ClassId`) VALUES ( ? , ?)'

    connection.query(query, [req.session.userEmail, courseId], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.end();
        }
        res.end();
    })
})

//SEARCH FOR COURSE USING SEARCH BAR
app.get("/searchForCourses", async function (req, res) {
    let searchString = req.query.search;
    console.log(searchString)

    var query = 'SELECT * FROM class WHERE CONCAT(DepartmentAcc,ClassNumber) = ?'
    connection.query(query, [searchString], (error, results, fields)=>{
        if (results.length>0){
            console.log(results);
            res.send(results);
            res.end();
        }
        res.end();
    })
})

app.listen(3000);
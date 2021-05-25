
$(document).ready(()=>{
    updateClassTable();
    updateAccountTable();
    updateStudentTable();
})

async function updateClassTable() {
    var classTable = await $.get("/adminclass");
    console.log(classTable);

    for (let i in classTable){
        let row = `<tr><td>${classTable[i]["ClassId"]}</td>
<td>${classTable[i]["DepartmentName"]}</td><td>${classTable[i]["DepartmentAcc"]}</td>
<td>${classTable[i]["ClassNumber"]}</td><td>${classTable[i]["InstructorEmail"]}</td>
<td>${classTable[i]["InstructorName"]}</td><td>${classTable[i]["Semester"]}</td>
<td>${classTable[i]["Description"]}</td><td>${classTable[i]["CountEnrolled"]}</td>
<td>${classTable[i]["CountCapacity"]}</td><td>${classTable[i]["ScheduleDays"]}</td>
<td>${classTable[i]["StartTime"]}</td><td>${classTable[i]["EndTime"]}</td>
<td>${classTable[i]["EnrollmentDeadline"]}</td></tr>`
        $("#classTable").append(row)
    }
}

async function updateAccountTable() {
    var accountTable = await $.get("/adminaccounts");
    console.log(accountTable);

    for (let i in accountTable){
        let row = `<tr><td>${accountTable[i]["id"]}</td><td>${accountTable[i]["email"]}</td>
<td>${accountTable[i]["password"]}</td><td>${accountTable[i]["FirstName"]}</td><td>${accountTable[i]["LastName"]}</td>
<td>${accountTable[i]["accountType"]}</td></tr>`
        $("#accountTable").append(row)
    }
}

async function updateStudentTable() {
    var studentTable = await $.get("/adminstudent");
    console.log(studentTable);

    for (let i in studentTable){
        let row = `<tr><td>${studentTable[i]["id"]}</td><td>${studentTable[i]["StudentEmail"]}</td>
<td>${studentTable[i]["ClassId"]}</td></tr>`
        $("#studentTable").append(row)
    }
}
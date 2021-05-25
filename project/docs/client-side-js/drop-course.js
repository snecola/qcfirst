
$(document).ready(async function() {
    console.log("Document ready!");
    let info = await $.get("/sessionInfo")
    const JSONInfo = JSON.parse(info);

    const accountType = JSONInfo["accountType"];
    const userEmail = JSONInfo["userEmail"];
    const fullName = JSONInfo["fullName"];

    if (!userEmail) {
        window.location.href=`/`;
    }

    var enrolledCourseList = await $.get('/getStudentCourses');
    console.log(enrolledCourseList);

    var courseToDrop = $("#courseToDrop");
    courseToDrop
        .empty()
        .prepend(`<option value="" disabled>Select a course:</option>`)

    for (let i in enrolledCourseList){
        let courseDep = enrolledCourseList[i]["DepartmentAcc"];
        let courseNum = enrolledCourseList[i]["ClassNumber"];
        let courseId = enrolledCourseList[i]["ClassId"];
        let instructorName = enrolledCourseList[i]["InstructorName"];
        let semester = enrolledCourseList[i]["Semester"];

        courseToDrop.append(`<option id="${i}" class="course-btn list-group-item list-group-item-action">${courseId}-${courseDep}${courseNum} ${instructorName} ${semester}</option>`)
    }
})
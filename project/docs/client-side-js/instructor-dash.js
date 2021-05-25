
$(document).ready(async function () {
    console.log("Document ready!");
    let info = await $.get("/sessionInfo")
    const JSONInfo = JSON.parse(info);

    const accountType = JSONInfo["accountType"];
    const userEmail = JSONInfo["userEmail"];
    const fullName = JSONInfo["fullName"];

    $("#dashHeading").after(`<h4 class="d-flex justify-content-center">Welcome, ${fullName}</h4>`)

    await updateCourseList();

})

async function updateCourseList() {

    var courseList = await $.get("/getInstructorCourses")
    console.log(courseList);

    $("#courseList")
        .empty()
        .append(`<a href="add-new-course.html" class="list-group-item list-group-item-action list-group-item-info">Create New Course +</a>`)

    for (let i=0; i<courseList.length; i++){
        let courseDep = courseList[i]["DepartmentAcc"];
        let courseNum = courseList[i]["ClassNumber"];
        let courseId = courseList[i]["ClassId"];
        let instructorName = courseList[i]["InstructorName"];
        let semester = courseList[i]["Semester"];

        $("#courseList").prepend(`<button id="${i}" class="course-btn list-group-item list-group-item-action">${courseDep}${courseNum}-${courseId} ${instructorName} ${semester}</button>`)
            .click((event) => {
            console.log(event)
            var url = "../course-manage-instructor.html?courseId=" + encodeURIComponent(courseId)
            window.location.href = url;
        })
    }

}

$("#logOutButton").click(() => {
    $.post("/logout")
    window.location.href = "/"
})
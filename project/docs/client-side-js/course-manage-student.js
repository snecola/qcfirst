
$(document).ready(async function () {
    console.log("Document ready!");
    let info = await $.get("/sessionInfo")
    const JSONInfo = JSON.parse(info);

    const accountType = JSONInfo["accountType"];
    const userEmail = JSONInfo["userEmail"];
    const fullName = JSONInfo["fullName"];

    if (!userEmail) {
        window.location.href=`/`;
    }

    console.log(accountType, userEmail, fullName);

    var queryString = new Array();

    if (queryString.length == 0) {
        if (window.location.search.split('?').length>1){
            var params = window.location.search.split('?')[1].split('&');
            for (var i = 0; i < params.length; i++) {
                var key = params[i].split('=')[0];
                var value = decodeURIComponent(params[i].split('=')[1]);
                queryString[key] = value;
            }
        }
    }
    console.log(queryString);
    console.log(queryString.courseId);

    var pageInfo = await $.get(`/courseInfo?courseId=${queryString.courseId}`)
    console.log("Course page info", pageInfo);

    var courseStudentList = await $.get(`/courseStudentList?courseId=${queryString.courseId}`)
    console.log("List of students", courseStudentList);

    for (let i in courseStudentList) {
        if (courseStudentList[i]["StudentEmail"] === userEmail){
            $("#enrollBtn").css("display","none")
        }
    }

    const classId = pageInfo[0]["ClassId"];
    const classNum = pageInfo[0]["ClassNumber"];
    const depAcc = pageInfo[0]["DepartmentAcc"];
    const depName = pageInfo[0]["DepartmentName"];
    const instructor = pageInfo[0]["InstructorName"];
    const semester = pageInfo[0]["Semester"];
    const enrollDead = pageInfo[0]["EnrollmentDeadline"].split("T")[0];
    const countCap = pageInfo[0]["CountCapacity"];
    const countEnrolled = courseStudentList.length;
    const desc = pageInfo[0]["Description"];
    const startTime = pageInfo[0]["StartTime"];
    const endTime = pageInfo[0]["EndTime"];
    const days = pageInfo[0]["ScheduleDays"].split(", ");

    console.log(classId, classNum, depAcc, depName, instructor, days);

    $("#className").text(`${depAcc}${classNum}`)
    $("#instructor").text(`${instructor}`);
    $("#classId").text(`${classId}`);
    $("#department").text(`${depName}`);
    $("#semester").text(`${semester}`);
    $("#deadLine").text(`${enrollDead}`);
    $("#capacity").text(`${countEnrolled}/${countCap}`);
    $("#classDescription").text(`${desc}`);

    for (let i in days) {
        $(`#${days[i]}`).text(`${startTime} - ${endTime}`)
        console.log(days[i]);
    }

    $("#enrollBtn").click(()=>{
        $.post(`/enrollInCourse?courseId=${queryString.courseId}`)
        setTimeout(()=>{
            window.location.href = '../student-dashboard.html'
        }, 500)
    })

})

$("#logOutButton").click(() => {
    $.post("/logout")
    window.location.href = "/"
})
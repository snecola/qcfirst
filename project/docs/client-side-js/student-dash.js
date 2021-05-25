
$(document).ready(async function () {
    console.log("Document ready!");
    let info = await $.get("/sessionInfo")
    const JSONInfo = JSON.parse(info);

    const accountType = JSONInfo["accountType"];
    const userEmail = JSONInfo["userEmail"];
    const fullName = JSONInfo["fullName"];

    $("#dashHeading").after(`<h4 class="d-flex justify-content-center">Welcome, ${fullName}</h4>`)

    var courseList = await $.get("/getStudentCourses")
    console.log(courseList);

    $("#enrolledList").empty()

    for (let i in courseList){
        let courseDep = courseList[i]["DepartmentAcc"];
        let courseNum = courseList[i]["ClassNumber"];
        let courseId = courseList[i]["ClassId"];
        let instructorName = courseList[i]["InstructorName"];
        let semester = courseList[i]["Semester"];

        $("#enrolledList").prepend(`<button id="${i}" class="course-btn list-group-item list-group-item-action">${courseDep}${courseNum}-${courseId} ${instructorName} ${semester}</button>`)
            .click((event) => {
                console.log(event)
                var url = "../course-manage-student.html?courseId=" + encodeURIComponent(courseId)
                window.location.href = url;
            })
    }

    $("#searchButton").click(async ()=>{
        var searchResults = await $.get(`/searchForCourses?search=${$("#courseSearchbar").val()}`);
        console.log($("#courseSearchbar").val())
        console.log(searchResults);

        for (let i in searchResults){
            let courseDep = searchResults[i]["DepartmentAcc"];
            let courseNum = searchResults[i]["ClassNumber"];
            let courseId = searchResults[i]["ClassId"];
            let instructorName = searchResults[i]["InstructorName"];
            let semester = searchResults[i]["Semester"];

            $("#searchResults").attr('style', '')

            $("#searchResultsList").prepend(`<button id="${i}" class="course-btn list-group-item list-group-item-action">${courseDep}${courseNum}-${courseId} ${instructorName} ${semester}</button>`)
                .click((event) => {
                    console.log(event)
                    var url = "../course-manage-student.html?courseId=" + encodeURIComponent(courseId)
                    window.location.href = url;
                })
        }
    })

})

$("#logOutButton").click(() => {
    $.post("/logout")
    window.location.href = "/"
})
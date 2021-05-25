
$(document).ready(async ()=>{
    await updateCourseList();
})

async function updateCourseList(){
    var courseList = await $.get("/adminclass")
    console.log(courseList);

    $("#courseList").empty()
    for (let i=0; i<courseList.length; i++){
        let courseDep = courseList[i]["DepartmentAcc"];
        let courseNum = courseList[i]["ClassNumber"];
        let courseId = courseList[i]["ClassId"];
        let instructorName = courseList[i]["InstructorName"];
        let semester = courseList[i]["Semester"];

        $("#courseList").prepend(`<button id="${i}" class="course-btn list-group-item list-group-item-action">${courseDep}${courseNum}-${courseId} ${instructorName} ${semester}</button>`)
        $(`#${i}`).click((event) => {
            console.log(event)
            var url = "../course-manage-student.html?courseId=" + encodeURIComponent(courseId)
            window.location.href = url;
        })
    }
}
$("#logOutButton").click(() => {
    $.post("/logout")
    window.location.href = "/"
})

async function updateCourseList() {
    var courseList = $("#courseList");
    courseList.innerText="";
    courseList.innerHTML="";
    courseList.appendChild('<a href=\"add-new-course.html\" class=\"list-group-item list-group-item-action list-group-item-info\">Create New Course +</a>');
    $.get()

}

$(document).ready(async function () {
    console.log("Document ready!");
    let info = await $.get("/sessionInfo")
    const JSONInfo = JSON.parse(info);

    const accountType = JSONInfo["accountType"];
    const userEmail = JSONInfo["userEmail"];
    const fullName = JSONInfo["fullName"];

    $("#dashHeading").after(`<h4 class="d-flex justify-content-center">Welcome, ${fullName}</h4>`)

    updateCourseList();

})


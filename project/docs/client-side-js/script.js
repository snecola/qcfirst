$("#logOutButton").click(() => {
    $.post("/logout")
    window.location.href = "/"
})
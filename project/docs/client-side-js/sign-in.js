
function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)) {
        return true;
    } else {
        return false;
    }
}
let userEmail = $("#email")
userEmail.focusout((e)=>{
    if (!validateEmail(userEmail.val())) {
        userEmail.css({border:"4px solid red"});
    } else {
        userEmail.css({border: 'none'});
    }
})
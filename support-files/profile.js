$(document).ready(function () {
    // Collects the user from localstorage
    let user = JSON.parse(localStorage.getItem("user"));

    // Checks if the user exists in LS and if true changes page to the index.html which contains the list
    if (user == null) {
        window.location.replace("/login.html");
    } else {
        $("#accountName").html(user.username);
    }

    $("#goBackBtn").click(function () {
        window.location.replace("/list.html");
    });

    $("#changePasswordBtn").click(function () {
        const oldP = $("#oldPassword").val();
        const newP = $("#newPassword").val();
        console.log(oldP);
        console.log(newP);
    });

    $("#changeUsernameBtn").click(function () {
        const oldP = $("#oldUsername").val();
        const newP = $("#newUsername").val();
        console.log(oldP);
        console.log(newP);
    });

    /**
     * Listener for the two input fields for username & password when pressing enter and calls the sendLoginCredentialsToDatabase function
     */
    // $("#username, #password").on("keydown", function (event) {
    //     if (event.keyCode == 13) {
    //         sendLoginCredentialsToDatabase();
    //     }
    // });

    /**
     * Function that collects the two values from the input fields and send them to the database.
     * The database returns a "bad request" if the credentials doesnt match any users in the database.
     * Otherwise it sends back that specific user and saves it to LS and then changes page to the index.html which contains the list
     */
    // function sendLoginCredentialsToDatabase() {
    //     const $username = $("#username").val();
    //     const $password = $("#password").val();
    //     $("#loadingSymbol").css("display", "block");
    //     $("#errorMessage").css("display", "none");

    //     fetch(
    //         `https://td-shoppinglist-backend.herokuapp.com/users/authentication?username=${$username}&password=${$password}`
    //     )
    //         .then(function (response) {
    //             if (response.status == 200) return response.json();
    //             else return response.text();
    //         })
    //         .then(function (data) {
    //             if (data == "Wrong credentials!") {
    //                 $("#errorMessage").css("display", "block");
    //                 $("#loadingSymbol").css("display", "none");
    //             } else {
    //                 $("#errorMessage").css("display", "none");
    //                 localStorage.setItem("user", JSON.stringify(data));
    //                 window.location.replace("/index.html");
    //             }
    //         });
    // }
});

$(document).ready(function () {
    if (localStorage.getItem("user") != null) {
        window.location.replace("/index.html");
    }

    $("#loginBtn").click(function () {
        sendLoginCredentialsToDatabase();
    });

    $("#username, #password").on("keydown", function (event) {
        if (event.keyCode == 13) {
            sendLoginCredentialsToDatabase();
        }
    });

    function sendLoginCredentialsToDatabase() {
        const $username = $("#username").val();
        const $password = $("#password").val();

        fetch(
            `https://td-shoppinglist-backend.herokuapp.com/users/authentication?username=${$username}&password=${$password}`
        )
            .then(function (response) {
                if (response.status == 200) return response.json();
                else return response.text();
            })
            .then(function (data) {
                if (data == "Wrong credentials!") {
                    $("#errorMessage").css("display", "block");
                } else {
                    $("#errorMessage").css("display", "none");
                    localStorage.setItem("user", JSON.stringify(data));
                    window.location.replace("/index.html");
                }
            });
    }
});

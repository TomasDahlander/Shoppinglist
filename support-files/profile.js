//***************************** Global variables ********************************/

let modalMessage; // The modal that is shown instead of alerts
let alertMessage; // Variable for the alertmessage element
let user = JSON.parse(localStorage.getItem("user")); // Collects the user from localstorage

//***************************** Inital user check ********************************/
$(document).ready(function () {
    // Redirects to login page if the user doesn't exists in localstorage otherwise sets the accountname
    if (user == null) {
        window.location.replace("/login.html");
    } else {
        $("#accountName").html(user.username);
    }

    //***************************** Listeners ********************************/

    /**
     * Listener for the go back button which redirects to the list page
     */
    $("#goBackBtn").click(function () {
        window.location.replace("/list.html");
    });

    /**
     * Closes the message board modal
     */
    $("#okMessageBtn").click(function () {
        modalMessage.css("display", "none");
    });

    /**
     * Listener for the change password button
     */
    $("#changePasswordBtn").click(function () {
        const oldPassword = $("#oldPassword").val();
        const newPassword = $("#newPassword").val();
        changePasswordInDatabase(oldPassword, newPassword);
    });

    /**
     * Listener for the change username button
     */
    $("#changeUsernameBtn").click(function () {
        const newUsername = $("#newUsername").val();
        changeUsernameInDatabase(newUsername);
    });

    /**
     * Listener for the two input fields for Username when pressing enter key
     */
    $("#newUsername").on("keydown", function (event) {
        if (event.keyCode == 13) {
            const newUsername = $("#newUsername").val();
            changeUsernameInDatabase(newUsername);
        }
    });

    /**
     * Listener for the two input fields for Password when pressing enter key
     */
    $("#oldPassword, #newPassword").on("keydown", function (event) {
        if (event.keyCode == 13) {
            const oldPassword = $("#oldPassword").val();
            const newPassword = $("#newPassword").val();
            changePasswordInDatabase(oldPassword, newPassword);
        }
    });

    //***************************** FUNCTIONS ********************************/

    /**
     * Function that takes a message and display the messagemodal with this message.
     * @param {String} message Message to be shown
     */
    function setAndDisplayAlertMessage(message) {
        alertMessage.html(message);
        modalMessage.css("display", "block");
    }

    /**
     * Function that collects the the old and new usernames and sends it to the database for change
     * and sets the new username in localstorage and the accountname element.
     * @param {String} newUsername The new username you want to change to
     */
    function changeUsernameInDatabase(newUsername) {
        const dto = {
            oldUsername: user.username,
            newUsername: newUsername,
            oldPassword: user.password,
        };

        fetch("https://td-shoppinglist-backend.herokuapp.com/users/updateUsername", {
            method: "POST",
            body: JSON.stringify(dto),
            headers: {
                "Content-type": "application/json",
            },
        })
            .then(function (response) {
                if (response.status != 200) {
                    return response.text();
                } else {
                    return response.json();
                }
            })
            .then(function (data) {
                if (typeof data === "string") {
                    setAndDisplayAlertMessage(data);
                } else {
                    user.username = data.username;
                    localStorage.setItem("user", JSON.stringify(data));
                    $("#accountName").html(user.username);
                    setAndDisplayAlertMessage(
                        `Your username have now been set to: ${user.username}`
                    );
                }
            });
    }

    /**
     * Function that collects the the old and new passwords and sends it to the database for change
     * and sets the new password in localstorage.
     * @param {String} oldPassword The old password
     * @param {String} newPassword The new password you want to change to
     */
    function changePasswordInDatabase(oldPassword, newPassword) {
        const dto = {
            oldUsername: user.username,
            oldPassword: oldPassword,
            newPassword: newPassword,
        };

        console.log(dto);

        fetch("https://td-shoppinglist-backend.herokuapp.com/users/updatePassword", {
            method: "POST",
            body: JSON.stringify(dto),
            headers: {
                "Content-type": "application/json",
            },
        })
            .then(function (response) {
                if (response.status != 200) {
                    return response.text();
                } else {
                    return response.json();
                }
            })
            .then(function (data) {
                if (typeof data === "string") {
                    setAndDisplayAlertMessage(data);
                } else {
                    user.password = data.password;
                    localStorage.setItem("user", JSON.stringify(data));
                    setAndDisplayAlertMessage(`Your password has now been changed`);
                }
            });
    }

    //***************************** Runs on load ********************************/
    modalMessage = $("#message-modal-div"); // sets the modal for message to a variable
    alertMessage = $("#alertMessage"); // sets the alert p element to a varialbe
});

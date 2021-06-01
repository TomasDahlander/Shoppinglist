// Global variables ********************************************************************************************************

let categories;

// Modals
let modalAdd;
let modalSetting;

// Elements
let categorySelect;
let addInputField;

$(document).ready(function () {
    // Listeners ***********************************************************************************************************
    /**
     * Displays the modal when clicking add
     */
    $("#addBtn").click(function () {
        modalAdd.css("display", "block");
    });
    /**
     * Hides the modal when clicking on the x or ok in the modalAdd
     */
    $("#modal-closer").click(function () {
        modalAdd.css("display", "none");
        resetAddInputValue();
    });
    /**
     * Doesn't work but should close the modal if user click outside of rule modal
     * @param {event} event
     */
    // window.onclick = function (event) {
    //     if (event.target == modal) {
    //         modal.css("display", "none");
    //     }
    // };
    // Functions ***********************************************************************************************************
    /**
     * Fetches the category array from a JSON file
     */
    function fetchCategories() {
        fetch("/support-files/Categories.json")
            .then((resp) => resp.json())
            .then((data) => setAndRenderCategories(data));
    }
    /**
     * Receives JSON data
     * @param {JSON} questionsDataArray
     */
    function setAndRenderCategories(categoryDataArray) {
        categories = categoryDataArray;

        for (cat of categories) {
            if (cat.name === "Övrigt") renderCategory(cat, "selected");
            else renderCategory(cat, "");
        }
    }

    /**
     * Functions that appends one category to dropdown options meny for categories when adding an item
     * @param {Object} category
     * @param {String} selected
     */
    function renderCategory(category, selected) {
        categorySelect.append(`
            <option class="option-input" style="background-color: ${category.color};" value="${category.id}" ${selected}>
            ${category.name}
            </option>
        `);
    }

    /**
     * Function that resets the values in the addModals input fields
     */
    function resetAddInputValue() {
        addInputField.val("");
        $("#modal-category-input option").each(function () {
            if (this.text == "Övrigt") $(this).prop("selected", true);
            else $(this).prop("selected", false);
        });
    }

    // Runs when loaded ****************************************************************************************************
    fetchCategories(); // Call our categoryfetch function
    modalAdd = $("#add-modal-div"); // sets our modal for adding to a variable
    categorySelect = $("#modal-category-input"); // sets out option selectos to a variable
    addInputField = $("#addInput");
});

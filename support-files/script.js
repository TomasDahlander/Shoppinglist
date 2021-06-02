// Global variables ********************************************************************************************************

let categories;
let itemList;

// Modals
let modalAdd;
// let modalSetting;

// Elements
let categorySelect;
let addInputField;
let tableArea;

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
   
    // Functions ***********************************************************************************************************

    /**
     * Fetches the category array from a JSON file
     */
    function fetchCategories() {
        fetch("/support-files/Categories.json")
            .then((response) => response.json())
            .then((data) => setAndRenderCategories(data));
    }
    /**
     * Receives JSON data with categories
     * @param {JSON} categoryDataArray
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
     * Fetches the item array from a JSON file
     */
    function fetchItems(){
        fetch("/support-files/Items.json")
        .then((response) => response.json())
        .then((data) => setAndRenderItems(data));
    }

    /**
     * Receives JSON data with items
     * @param {JSON} categoryDataArray
     */
    function setAndRenderItems(itemDataArray){
        itemList = itemDataArray;
        
        for(item of itemList){
            renderItem(item);
        }
    }

    /**
     * Functions that appends one item to the table for items
     * @param {Object} item
     */
    function renderItem(item){
        let color;
        let rowClasses;
        if(item.checked) {
            color = item.category.colorfade;
            rowClasses = "row-item checked-item";
        }
        else {
            color = item.category.color;
            rowClasses = "row-item";
        }
        tableArea.append(`
            <tr id="${item.id}" style="background-color: ${color};">
                <td class="${rowClasses}">${item.name}</td>
                <td class="row-button">&vellip;</td>
            </tr>
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
    fetchItems();
    modalAdd = $("#add-modal-div"); // sets the modal for adding to a variable
    categorySelect = $("#modal-category-input"); // sets the option selector to a variable
    addInputField = $("#addInput"); // sets the input field in the add modal to a variable
    tableArea = $("#tableArea"); // sets the item table to a variable
});

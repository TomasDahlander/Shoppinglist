// Global variables ********************************************************************************************************

let categories;
let itemList;
let user;

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
     * Hides the modal when clicking on the x in the modalAdd
     */
    $("#modal-closer").click(function () {
        modalAdd.css("display", "none");
        resetAddInputValue();
    });

    $("#okAddBtn").click(function(){
        getInfoFromAddModal()
        modalAdd.css("display", "none");
        resetAddInputValue();
    });
   
    // Functions ***********************************************************************************************************

    /**
     * Fetches the user from a JSON file
     */
     function fetchUser() {
        fetch("/support-files/Users.json")
            .then((response) => response.json())
            .then((data) => setUser(data));
    }
    /**
     * Receives JSON data with user info
     * @param {JSON} categoryDataArray
     */
    function setUser(userInfo) {
        user = userInfo;
    }

    /**
     * Function that reads the input from the add modal and sends an item object to the 
     * renderItem function with false to onload so the item will be placed on the top of the list
     */
    function getInfoFromAddModal(){
        const itemName = addInputField.val();
        const categoryName = categorySelect.val();

        let categoryid; 
        let color;
        let colorfade;

        for(cat of categories){
            if(cat.name == categoryName) {
                categoryid = cat.id;
                color = cat.color;
                colorfade = cat.colorfade;
            }
        }

        let item = {
            "name": itemName,
            "checked": false,
            "category": {
                "id": categoryid,
                "name": categoryName,
                "color": color,
                "colorfade": colorfade
            },
            "users": {
                "id": user.id
            }
        }
        renderItem(item, false);
    }

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
            <option id="${category.id}" class="option-input" style="background-color: ${category.color};" ${selected}>
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
            renderItem(item, true);
        }
    }

    /**
     * Functions that appends one item to the table for items
     * @param {Object} item
     */
    function renderItem(item, onload){
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
        if(onload){
            tableArea.append(`
            <tr id="${item.id}" style="background-color: ${color};">
                <td class="${rowClasses}">${item.name}</td>
                <td class="row-button">&vellip;</td>
            </tr>
            `);
        }
        else{
            tableArea.prepend(`
            <tr id="${item.id}" style="background-color: ${color};">
                <td class="${rowClasses}">${item.name}</td>
                <td class="row-button">&vellip;</td>
            </tr>
            `);
        }
        
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
    fetchUser() // Call the user fetch function
    fetchCategories(); // Call the category fetch function
    fetchItems(); // Call the item fetch function
    modalAdd = $("#add-modal-div"); // sets the modal for adding to a variable
    categorySelect = $("#modal-category-input"); // sets the option selector to a variable
    addInputField = $("#addInput"); // sets the input field in the add modal to a variable
    tableArea = $("#tableArea"); // sets the item table to a variable
});

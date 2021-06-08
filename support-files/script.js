// Global variables ********************************************************************************************************

// Lists & items
let categories; 
let itemList;
let user;
let sorter;

// Modals
let modalAdd;
let modalEdit;
// let modalSetting;

// Elements
let categorySelectAddModal; // The selector field where you choose the category for your item which to add to the list
let addInputField; // The input field where you enter a item to add to the list
let categorySelectEditModal;
let editInputField;
let tableArea; // The table where the items are displayed within

// Cache memory for less looping
let currentEditableItemId;

$(document).ready(function () {
    // Listeners that can be initiated on load *****************************************************************************

    /**
     * Displays the modal when clicking add
     */
    $("#addBtn").click(function () {
        modalAdd.css("display", "block");
    });

    /**
     * Hides the modal when clicking on the x in the modalAdd
     */
    $("#add-modal-closer").click(function () {
        modalAdd.css("display", "none");
        resetAddInputValue();
    });

    /**
     * Hides the editing when clicking on the x in the modalEdit
     */
    $("#edit-modal-closer").click(function () {
        modalEdit.css("display", "none");
    });

    /**
     * Collects and adds an item to the list from the add modal
     */
    $("#okAddBtn").click(function () {
        getInfoFromAddModal();
        modalAdd.css("display", "none");
        resetAddInputValue();
    });

    $("#okEditBtn").click(function(){
        updateHtmlListItem();
        modalEdit.css("display", "none");
    });

    /**
     * Sorts the elements in the list depending on the sorting value for that category
     */
    $("#sortingBtn").click(function () {
        sortTable();
    });

    // Functions ***********************************************************************************************************

    /**
     * Fetches the user from a JSON file and sets it to the variable user
     */
    function fetchUser() {
        fetch("/support-files/mockdata/Users.json")
            .then((response) => response.json())
            .then(function (userinfo) {
                user = userinfo;
            });
    }

    /**
     * Fetches the sorter from a JSON file and sets it to the variabler sorter
     */
    function fetchSorter() {
        fetch("/support-files/mockdata/Sorter.json")
            .then((response) => response.json())
            .then(function (data) {
                sorter = data;
            });
    }

    /**
     * Fetches the category array from a JSON file
     */
    function fetchCategories() {
        fetch("/support-files/mockdata/Categories.json")
            .then((response) => response.json())
            .then((data) => setAndRenderCategories(data));
    }

    /**
     * Receives JSON data with categories
     * @param {JSON} categoryDataArray
     */
    function setAndRenderCategories(categoryDataArray) {
        categories = categoryDataArray;

        // Loops through the categories and sets that the Övrigt should be selected from start
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
        categorySelectAddModal.append(`
            <option id="${category.id}" class="option-input" style="background-color: ${category.color};" ${selected}>
            ${category.name}
            </option>
        `);
        categorySelectEditModal.append(`
            <option id="${category.id}" class="option-input" style="background-color: ${category.color};" ${selected}>
            ${category.name}
            </option>
        `);
    }

    /**
     * Fetches the item array from a JSON file
     */
    function fetchItems() {
        fetch("/support-files/mockdata/Items.json")
            .then((response) => response.json())
            .then((data) => setAndRenderItems(data));
    }

    /**
     * Receives JSON data with items
     * @param {JSON} categoryDataArray
     */
    function setAndRenderItems(itemDataArray) {
        itemList = itemDataArray;

        // Sends each item to the item render function with true becouse this is on page load
        for (item of itemList) {
            renderItem(item, true);
        }
    }

    /**
     * Functions that appends one item to the table for items
     * @param {Object} item
     */
    function renderItem(item, onload) {
        const color = item.category.color;

        let rowClasses;
        let sortvalue;

        // Checks the sort value from the sorter for the category and sets the html element value for later sorting
        for (s of sorter) {
            if (s.categoryName == item.category.name) {
                sortvalue = s.sortvalue;
                break;
            }
        }

        // Checks if the item is checked and sets the classes accordingly
        if (item.checked) {
            rowClasses = "row-item checked-item";
        } else {
            rowClasses = "row-item";
        }

        // Appends or prepends the html element depending on if it is on load or on adding an item
        if (onload) {
            tableArea.append(`
            <tr style="background-color: ${color};">
                <td id="${item.id}" value="${sortvalue}" name="${item.category.name}" class="${rowClasses}">${item.name}</td>
                <td id="edit${item.id}" class="row-button">&vellip;</td>
            </tr>
            `);
        } else {
            tableArea.prepend(`
            <tr style="background-color: ${color};">
                <td id="${item.id}" value="${sortvalue}" name="${item.category.name}" class="${rowClasses}">${item.name}</td>
                <td id="edit${item.id}" class="row-button">&vellip;</td>
            </tr>
            `);
        }

        /**
         * Listener on the id for the item element rows that toggles if the items is checkod or not 
         */
        $(`#${item.id}`).click(function(){
            const id = $(this).prop("id");
            $(this).toggleClass("checked-item");
            changeItemCheckedStatusInListForId(id);
        });

        /**
         * Listener for the edit button for each element thats added to the item table list
         */
        $(`#edit${item.id}`).click(function(){
            // listElement = $(this).parent();
            currentEditableItemId = `${item.id}`;
            // listElement.css({"background-color":"orange"});
            setUpEditModal(`${item.id}`);
            modalEdit.css("display", "block");
        });

    }

    /**
     * Function that toggle the checked status in the itemList
     * @param {Long} id 
     */
    function changeItemCheckedStatusInListForId(id){
        for(item of itemList){
            if(item.id == id){
                if(item.checked) item.checked = false;
                else item.checked = true;
                break;
            }
        }
    }

    /**
     * Function that populates the modal with the info from the item from the row you clicked on
     * @param {Long} id 
     */
    function setUpEditModal(id){
        for(item of itemList){
            if(id == item.id) {
                editInputField.val(item.name);
                categorySelectEditModal.val(item.category.name);
                break;
            }
        }
    }

    /**
     * 
     * @returns Exits function if input field is empty.
     */
    function updateHtmlListItem(){
        const itemName = editInputField.val();
        if(itemName.length == 0) return; // if no content is typed in exit the function here

        const categoryName = categorySelectEditModal.val();
        let categoryId;
        let color;
        let sortvalue;

        // Loops through the categories to get the correct id and color values
        for (cat of categories) {
            if (cat.name == categoryName) {
                categoryId = cat.id;
                color = cat.color;
            }
        }

        // Checks the sort value from the sorter for the category and sets the html element value for later sorting
        for (s of sorter) {
            if (s.categoryName == categoryName) {
                sortvalue = s.sortvalue;
                break;
            }
        }

        // Update the array and then the html list
        for(item of itemList){
            if(item.id == currentEditableItemId){
                item.name = itemName;
                item.category.id = categoryId;
                item.category.name = categoryName;
                item.category.color = color;
                break;
            }
        }

        // Changes the html element
        const itemElement = $(`#${currentEditableItemId}`);
        itemElement.text(itemName);
        itemElement.attr("value",sortvalue);
        itemElement.parent().css({"background-color":`${color}`});
        itemElement.attr("name",categoryName);
    }

    /**
     * Function that reads the input from the add modal and sends an item object to the
     * renderItem function with false to onload so the item will be placed on the top of the list
     */
    function getInfoFromAddModal() {
        // Get and check the input value
        const itemName = addInputField.val();
        if (itemName.length == 0) return; // if no content is typed in exit the function here

        const categoryName = categorySelectAddModal.val();
        let categoryid;
        let color;

        // Loops through the categories to get the correct id and color values
        for (cat of categories) {
            if (cat.name == categoryName) {
                categoryid = cat.id;
                color = cat.color;
            }
        }

        // Creates an item object
        let item = {
            name: itemName,
            checked: false,
            category: {
                id: categoryid,
                name: categoryName,
                color: color,
            },
            users: {
                id: user.id,
            },
        };

        // Adds the item to the itemList and render the item to the html list with the parameter onload = false
        itemList.unshift(item);
        renderItem(item, false);
    }

    /**
     * Function that resets the values in the addModals input fields by looping through and checks for category Övrigt
     */
    function resetAddInputValue() {
        addInputField.val("");
        $("#modal-category-input option").each(function () {
            if (this.text == "Övrigt") {
                $(this).prop("selected", true);
            }
        });
    }

    /**
     * Sorting the elements in the item table
     */
    function sortTable() {
        let table, rows, switching, a, b;

        // Set the table to a variable and start with the switching
        table = document.getElementById("tableArea");
        switching = true;

        // Loops while not all is sorted
        while (switching) {
            switching = false;
            rows = table.rows;

            // Loops through all the tr elements in the table
            for (let i = 0; i < rows.length - 1; i++) {
                a = rows[i].getElementsByTagName("td")[0];
                b = rows[i + 1].getElementsByTagName("td")[0];

                // Switch places of two elements if the are in the wrong sort order and starts a new loop
                if (a.getAttribute("value") > b.getAttribute("value")) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    break;
                }
            }
        }
    }

    // Runs when loaded ****************************************************************************************************
    fetchUser(); // Call the user fetch function
    fetchSorter(); // Call the sorter fetch function
    fetchCategories(); // Call the category fetch function
    fetchItems(); // Call the item fetch function
    modalAdd = $("#add-modal-div"); // sets the modal for adding to a variable
    modalEdit = $("#edit-modal-div"); // sets the modal for editing to a variable
    categorySelectAddModal = $("#add-modal-category-input"); // sets the option selector to a variable on the adding modal;
    categorySelectEditModal = $("#edit-modal-category-input"); // sets the option selector to a variable on the editing modal;
    addInputField = $("#addInput"); // sets the input field in the add modal to a variable
    editInputField = $("#editInput"); // sets the input field in the edit modal to a variable
    tableArea = $("#tableArea"); // sets the item table to a variable
});

// Global variables ********************************************************************************************************

// Lists & items
let user = JSON.parse(localStorage.getItem("user"));
let categories;
let itemList;
let sorter;
let stores = [];

// Modals
let modalAdd;
let modalEdit;
let modalSettings;
let storeRemoveModal;
let storeChangeNameModal;
let modalCreateStore;

// Elements
let categorySelectAddModal; // The selector field where you choose the category for your item which to add to the list
let addInputField; // The input field where you enter an item to add to the list
let categorySelectEditModal; // The selector field where you choose the category for the item of which you are editing
let editInputField; // The input field where you edit an items name
let storeSelectSettingModal; // The selector field for the choosen store
let renameStoreInputField; // The input field for renaming a store
let createNewStoreInputField; // The input field for creating a store
let tableArea; // The table where the items are displayed within
let sortingtable; // The table where the sorters are displayed within

// Cache memory for less looping
let currentEditableItemId;

// Memory for swiping
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

$(document).ready(function () {
    if (localStorage.getItem("user") == null) {
        window.location.replace("/login.html");
    }

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
     * Hides the editing modal when clicking on the x in the modalEdit
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

    /**
     * Updates the current list element both in list and the html table list and closes the modal
     */
    $("#okEditBtn").click(function () {
        updateHtmlListItem();
        modalEdit.css("display", "none");
    });

    /**
     * Displays the settings modal
     */
    $("#settingsBtn").click(function () {
        modalSettings.css("display", "block");
    });

    /**
     * Hides the setting modal when clicking on the x in the modalSetting
     */
    $("#sorter-modal-closer").click(function () {
        modalSettings.css("display", "none");
    });

    /**
     * Button that updates the sorter and sets it for use when sorting
     */
    $("#updateSorterBtn").click(function () {
        updateSorterAndHtml();
    });

    /**
     * When choosing a new store this event is triggered to display the sorter for that store
     */
    $("#sorter-modal-category-input").change(function () {
        displaySorter();
        tableArea.children().each(function () {
            const store = storeSelectSettingModal.val();
            const category = $(this).children("td.row-item").attr("name");
            const sortvalue = getCorrectSortingValue(store, category);
            $(this).children("td.row-item").attr("value", sortvalue);
        });
    });

    /**
     * Sorts the elements in the list depending on the sorting value for that category
     */
    $("#sortingBtn").click(function () {
        sortTable();
    });

    $("#refreshBtn").click(function () {
        updateItemChecks();
    });

    $("#logutBtn").click(function () {
        localStorage.removeItem("user");
        window.location.replace("/login.html");
    });

    $("#createSorterBtn").click(function () {
        console.log("Clicked on new store button!");
        modalCreateStore.css("display", "block");
    });

    $("#create-store-modal-closer").click(function () {
        modalCreateStore.css("display", "none");
    });

    $("#createNewStoreBtn").click(function () {
        sendNewStoreToDatabase();
        modalCreateStore.css("display", "none");
    });

    $("#removeSorterBtn").click(function () {
        let store = storeSelectSettingModal.val();
        $("#removingStoreBanner").text(store);
        storeRemoveModal.css("display", "block");
    });

    $("#yesRemoveStoreBtn").click(function () {
        deleteCurrentSorter();
        storeRemoveModal.css("display", "none");
    });

    $("#noRemoveStoreBtn").click(function () {
        storeRemoveModal.css("display", "none");
    });

    $("#renameSorterBtn").click(function () {
        let store = storeSelectSettingModal.val();
        $("#renameStoreBanner").text(store);
        storeChangeNameModal.css("display", "block");
    });

    $("#rename-store-modal-closer").click(function () {
        storeChangeNameModal.css("display", "none");
    });

    $("#updateSorterNameBtn").click(function () {
        updateSorterName();
    });

    // Functions ***********************************************************************************************************

    /**
     * Fetches the sorter from the database and sets it to the variable sorter
     */
    function fetchSorter() {
        fetch(`https://td-shoppinglist-backend.herokuapp.com/sorting/get/${user.id}`) //  /support-files/mockdata/Sorter.json
            .then((response) => response.json())
            .then(function (data) {
                sorter = data;
            })
            .then(function () {
                setUpStoreChoices();
            })
            .then(() => fetchCategories());
    }

    /**
     * Function that sets up the choices you have for the stores
     */
    function setUpStoreChoices() {
        for (s of sorter) {
            if (!stores.includes(s.storeName)) {
                stores.push(s.storeName);
            }
        }

        for (store of stores) {
            storeSelectSettingModal.append(`
            <option class="option-input">
                ${store}
            </option> 
            `);
        }
    }

    function deleteCurrentSorter() {
        const store = storeSelectSettingModal.val();

        sorter = sorter.filter(function (value, index, arr) {
            return value.storeName != store;
        });

        storeSelectSettingModal.children().each(function () {
            if ($(this).val() == store) {
                $(this).remove();
            }
        });

        displaySorter();

        fetch(
            `https://td-shoppinglist-backend.herokuapp.com/sorting/delete/by/name/${store}/id/${user.id}`,
            {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json",
                },
            }
        ).then(function (response) {
            if (response.status != 200) {
                alert("Could not delete sorters in database!");
            }
        });
    }

    /**
     * Fetches the category array from the database
     */
    function fetchCategories() {
        fetch("https://td-shoppinglist-backend.herokuapp.com/category/get")
            .then((response) => response.json())
            .then((data) => setAndRenderCategories(data))
            .then(() => fetchItems());
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
     * Fetches the item array from the database
     */
    function fetchItems() {
        fetch(`https://td-shoppinglist-backend.herokuapp.com/item/get/${user.id}`)
            .then((response) => response.json())
            .then((data) => setAndRenderItems(data))
            .then(() => displaySorter())
            .then(() => sortTable());
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
                sortvalue = s.sortValue;
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
        $(`#${item.id}`).click(function () {
            const id = $(this).prop("id");
            $(this).toggleClass("checked-item");
            changeItemCheckedStatusInListForId(id);
        });

        // Set up swipe right start touch listener for deleting items
        document.getElementById(`${item.id}`).addEventListener("touchstart", function (event) {
            touchStartX = event.changedTouches[0].screenX;
            touchStartY = event.changedTouches[0].screenY;
        });

        // Set up swipe right end touch listener for deleting items
        document.getElementById(`${item.id}`).addEventListener("touchend", function (event) {
            currentEditableItemId = `${item.id}`;
            touchEndX = event.changedTouches[0].screenX;
            touchEndY = event.changedTouches[0].screenY;
            deleteItemFromHtmlListById(`${item.id}`);
        });

        /**
         * Listener for the edit button for each element thats added to the item table list
         */
        $(`#edit${item.id}`).click(function () {
            currentEditableItemId = `${item.id}`;
            setUpEditModal(`${item.id}`);
            modalEdit.css("display", "block");
        });
    }

    /**
     * Function that takes an id of an element and removes the parent så it is removed from the list
     * and then it send it the function deleteItemById
     * @param {Long} id
     */
    function deleteItemFromHtmlListById(id) {
        const xValue = touchEndX - touchStartX;
        const yValue = touchEndY - touchStartY;
        if (xValue > 100 && yValue > -25 && yValue < 25) {
            $(`#${id}`).parent().remove();
            deleteItemFromDatabaseById(id);
        }
    }

    function deleteItemFromDatabaseById(id) {
        fetch(`https://td-shoppinglist-backend.herokuapp.com/item/delete/${id}`).then(function (
            response
        ) {
            if (response.status != 200)
                alert("Something went wrong when deleting item from database!");
        });
    }

    /**
     * Function that displays the sorter from the current choice
     */
    function displaySorter() {
        // Sorting the sorter to display the categories in correct order
        sorter.sort(function (a, b) {
            return a.sortValue - b.sortValue;
        });

        sortingtable.html("");
        const choice = storeSelectSettingModal.val();

        for (s of sorter) {
            let color;
            if (s.storeName == choice) {
                for (cat of categories) {
                    if (s.categoryName == cat.name) {
                        color = cat.color;
                        break;
                    }
                }

                sortingtable.append(`
                    <tr>  
                        <td id="${s.id}" class="sorter-display" style="background-color: ${color};">${s.categoryName}</td>
                        <td style="width: 20%;" class="sorter-input">
                            <input 
                            type="number"
                            class="form-control"
                            value="${s.sortValue}"
                            >
                        </td>
                    </tr>
                    `);
            }
        }
    }

    /**
     * Function that update the selected sorter object and then updates the html elements so sorting can be done
     */
    function updateSorterAndHtml() {
        const store = storeSelectSettingModal.val();
        let sortArray = [];

        for (s of sorter) {
            if (s.storeName == store) {
                const sortvalue = $(`#${s.id}`).next().children("input.form-control").val();
                if (validateSorterInput(sortvalue)) {
                    return;
                }
                s.sortValue = sortvalue;
                sortArray.push(sortvalue);
            }
        }

        if (validateEntireSorter(sortArray)) {
            alert("Categories can't have the same value!");
            return;
        }

        tableArea.children().each(function () {
            const category = $(this).children("td.row-item").attr("name");
            const sortvalue = getCorrectSortingValue(store, category);
            $(this).children("td.row-item").attr("value", sortvalue);
        });
        updateSorterInDatabase();
    }

    function updateSorterName() {
        const oldStore = storeSelectSettingModal.val();
        const newStore = renameStoreInputField.val();

        for (s of sorter) {
            if (s.storeName == oldStore) s.storeName = newStore;
        }

        storeSelectSettingModal.children().each(function () {
            if ($(this).val() == oldStore) {
                $(this).text(newStore);
            }
        });

        storeChangeNameModal.css("display", "none");

        updateSorterInDatabase();
    }

    /**
     * Function that checks if the new input is a valid value and returns true if it is not valid
     * @param {int} sortInputValue
     * @returns
     */
    function validateSorterInput(sortInputValue) {
        if (sortInputValue.length < 1) {
            alert("All categories must have input values!");
            return true;
        } else if (sortInputValue > 6) {
            alert("Value can't be higher then 6!");
            return true;
        } else if (sortInputValue < 1) {
            alert("Value can't be 0 or lower!");
        } else return false;
    }

    /**
     * Function that checks the entire new sortervalues if there is any duplicates and return true inte that case
     * @param {array} sortArray
     * @returns boolean
     */
    function validateEntireSorter(sortArray) {
        sortArray = sortArray.sort();

        for (let i = 0; i < sortArray.length - 1; i++) {
            if (sortArray[i] >= sortArray[i + 1]) {
                return true;
            }
        }
        return false;
    }

    /**
     * Function that gets 2 strings with the storename and a category and returns the correct sorting value
     * @param {String} store
     * @param {String} category
     * @returns sorting value from sorter list
     */
    function getCorrectSortingValue(store, category) {
        for (s of sorter) {
            if (s.categoryName == category && s.storeName == store) return s.sortValue;
        }
    }

    /**
     * Function that toggle the checked status in the itemList
     * @param {Long} id
     */
    function changeItemCheckedStatusInListForId(id) {
        for (item of itemList) {
            if (item.id == id) {
                if (item.checked) item.checked = false;
                else item.checked = true;
                break;
            }
        }
    }

    /**
     * Function that populates the modal with the info from the item from the row you clicked on
     * @param {Long} id
     */
    function setUpEditModal(id) {
        for (item of itemList) {
            if (id == item.id) {
                editInputField.val(item.name);
                categorySelectEditModal.val(item.category.name);
                break;
            }
        }
    }

    /**
     * Function that udates the html elements in the list
     * @returns Exits function if input field is empty.
     */
    function updateHtmlListItem() {
        const itemName = editInputField.val();
        if (itemName.length == 0) return; // if no content is typed in exit the function here

        const categoryName = categorySelectEditModal.val();
        const store = storeSelectSettingModal.val();
        let categoryId;
        let color;
        let sortvalue;

        // Loops through the categories to get the correct id and color values
        for (cat of categories) {
            if (cat.name == categoryName) {
                categoryId = cat.id;
                color = cat.color;
                break;
            }
        }

        // Checks the sort value from the sorter for the category and sets the html element value for later sorting
        for (s of sorter) {
            if (s.categoryName == categoryName && s.storeName == store) {
                sortvalue = s.sortvalue;
                break;
            }
        }

        // Update the array and then the html list
        for (item of itemList) {
            if (item.id == currentEditableItemId) {
                item.name = itemName;
                item.category.id = categoryId;
                item.category.name = categoryName;
                item.category.color = color;
                break;
            }
        }

        updateItemInDatabase();

        // Changes the html element
        const itemElement = $(`#${currentEditableItemId}`);
        itemElement.text(itemName);
        itemElement.attr("value", sortvalue);
        itemElement.parent().css({ "background-color": `${color}` });
        itemElement.attr("name", categoryName);
    }

    /**
     * Function that checks the last editable id and sends that item to the database for update
     * and alerts if it didnt connect to the database.
     */
    function updateItemInDatabase() {
        let item;
        for (i of itemList) {
            if (i.id == currentEditableItemId) {
                item = i;
                break;
            }
        }

        fetch("https://td-shoppinglist-backend.herokuapp.com/item/add", {
            method: "POST",
            body: JSON.stringify(item),
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (response) {
            if (response.status != 200) {
                alert("Could not update item in database!");
            }
        });
    }

    function updateSorterInDatabase() {
        fetch("https://td-shoppinglist-backend.herokuapp.com/sorting/update", {
            method: "POST",
            body: JSON.stringify(sorter),
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (response) {
            if (response.status != 200) {
                alert("Could not update sorters in database!");
            }
        });
    }

    function sendNewStoreToDatabase() {
        const newSorterName = createNewStoreInputField.val();

        fetch(
            `https://td-shoppinglist-backend.herokuapp.com/sorting/add/with/name/${newSorterName}/userid/${user.id}`,
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
            }
        )
            .then(function (response) {
                if (response.status != 200) {
                    return "error";
                } else {
                    return response.json();
                }
            })
            .then(function (data) {
                if (data == "error") {
                    alert("Could not create new store in database!");
                } else {
                    addNewStoreToHtmlList(data);
                }
            });
    }

    function addNewStoreToHtmlList(newSorter) {
        for (s of newSorter) {
            sorter.push(s);
        }

        storeSelectSettingModal.append(`
            <option class="option-input">
                ${newSorter[0].storeName}
            </option> 
        `);
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
            user: {
                id: user.id,
            },
        };

        // Sends the item to the database and when returned is added to the Html list
        sendItemToDatabase(item);
    }

    function sendItemToDatabase(item) {
        fetch("https://td-shoppinglist-backend.herokuapp.com/item/add", {
            method: "POST",
            body: JSON.stringify(item),
            headers: {
                "Content-type": "application/json",
            },
        })
            .then(function (response) {
                if (response.status == 200) {
                    return response.json();
                } else return "error";
            })
            .then(function (data) {
                if (data == "error") {
                    alert("Could not send item to database!");
                } else {
                    itemList.unshift(data);
                    renderItem(data, false);
                }
            })
            .then(() => resetAddInputValue());
    }

    /**
     * Function that resets the values in the addModals input fields by looping through and checks for category Övrigt
     */
    function resetAddInputValue() {
        addInputField.val("");
        $("#add-modal-category-input").val("Övrigt");
    }

    /**
     * Function that send the entire itemList to the database to update all checked item etc
     */
    function updateItemChecks() {
        fetch("https://td-shoppinglist-backend.herokuapp.com/item/add/list", {
            method: "POST",
            body: JSON.stringify(itemList),
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (response) {
            if (response.status != 200) {
                alert("Could not update items in database!");
            } else {
                alert("All items updated!");
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
    // fetchCategories(); // Call the category fetch function
    // fetchItems(); // Call the item fetch function
    modalAdd = $("#add-modal-div"); // sets the modal for adding to a variable
    modalEdit = $("#edit-modal-div"); // sets the modal for editing to a variable
    modalSettings = $("#sorter-modal-div"); // sets the modal for settings to a variable
    modalCreateStore = $("#new-sorter-modal-div"); // sets the modal for create new store to a varable
    storeRemoveModal = $("#remove-sorter-modal-div"); // set the modal for removing a store
    storeChangeNameModal = $("#rename-sorter-modal-div"); // set the modal for changing store name
    categorySelectAddModal = $("#add-modal-category-input"); // sets the option selector to a variable on the adding modal
    categorySelectEditModal = $("#edit-modal-category-input"); // sets the option selector to a variable on the editing modal
    storeSelectSettingModal = $("#sorter-modal-category-input"); // set the option selector to a variable on the setting modal
    addInputField = $("#addInput"); // sets the input field in the add modal to a variable
    editInputField = $("#editInput"); // sets the input field in the edit modal to a variable
    renameStoreInputField = $("#storeNameChangeInput"); // sets the input field for renaming store to a variable
    createNewStoreInputField = $("#createStoreNameInput"); // sets the input field for creating a new store to a variable
    tableArea = $("#tableArea"); // sets the item table to a variable
    sortingtable = $("#sortingtable"); // sets the sorters table to a variable
    fetchSorter(); // Call the sorter fetch function which is later linked to the remaining fetches below
    // fetchCategories(); // Call the category fetch function
    // fetchItems(); // Call the item fetch function
});

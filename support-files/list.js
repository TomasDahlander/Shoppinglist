// Global variables ********************************************************************************************************

// Lists & item variables
let user = JSON.parse(localStorage.getItem("user"));
let categories; // Array that contains the category objects
let itemList; // Array that contains the item objects
let sorter; // Array that contains the sorters for the specific user
let stores = []; // Array that contains all the different stores for the specific user

// Modals variables
let modalAdd; // The modal that is shown when clicking on the add + button where you can add an item
let modalEdit; // The modal that i shown when clicking on the edit button next to an item
let modalStores; // The modal that is shown when clicking on the stores button where you can change store etc
let modalRemoveStore; // The modal that is shown when clicking on the Remove current store button
let modalChangeStoreName; // The modal that is shown when clicking on the Rename store button
let modalCreateStore; // The modal that is shown when clicking on the Add new store + button
let modalMessage; // The modal that is shown instead of alerts

// Elements variables
let categorySelectAddModal; // The selector field where you choose the category for your item which to add to the list
let addInputField; // The input field where you enter an item to add to the list
let categorySelectEditModal; // The selector field where you choose the category for the item of which you are editing
let editInputField; // The input field where you edit an items name
let storeSelectOnStoreModal; // The selector field for the choosen store
let renameStoreInputField; // The input field for renaming a store
let createNewStoreInputField; // The input field for creating a store
let tableArea; // The table where the items are displayed within
let sortingtable; // The table where the sorters are displayed within
let alertMessage; // The message that is displayed instead of the alerts

// Cache last id in memory for less looping
let currentEditableItemId;

// Memory for swiping
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

$(document).ready(function () {
    // Checks if the user exists in LS and if not changes page to the login.html
    if (localStorage.getItem("user") == null) {
        window.location.replace("/login.html");
    }

    // Listeners that can be initiated on load *****************************************************************************

    /**
     * Displays the modalAdd when clicking on Add + button
     */
    $("#addBtn").click(function () {
        modalAdd.css("display", "block");
    });

    /**
     * Hides the modal when clicking on the X in the modalAdd and calls the resetAddInputValue function
     */
    $("#add-modal-closer").click(function () {
        modalAdd.css("display", "none");
        resetAddInputValue();
    });

    /**
     * Hides the modalEdit when clicking on the X in the modalEdit
     */
    $("#edit-modal-closer").click(function () {
        modalEdit.css("display", "none");
    });

    /**
     * Calls the getInfoFromAddModal and resetValueInputvalue functions, and closes the modalAdd when clicking on the OK button on the modalAdd
     */
    $("#okAddBtn").click(function () {
        getInfoFromAddModal();
        modalAdd.css("display", "none");
        resetAddInputValue();
    });

    /**
     * Calls the updateHtmlListItem function and closes the modalEdit when clicking OK in modalEdit
     */
    $("#okEditBtn").click(function () {
        updateHtmlListItem();
        modalEdit.css("display", "none");
    });

    /**
     * Calls the deleteItemFromHtmlListById function when pressing on the remove item button on the editModal
     */
    $("#itemRemoveBtn").click(function () {
        $(`#${currentEditableItemId}`).parent().remove();
        deleteItemFromDatabaseById(currentEditableItemId);
        modalEdit.css("display", "none");
    });

    /**
     * Displays the modalStores when clicking on the Store button
     */
    $("#storesBtn").click(function () {
        modalStores.css("display", "block");
    });

    /**
     * Closes the modalStore when clicking on the X in the modalStore
     */
    $("#sorter-modal-closer").click(function () {
        modalStores.css("display", "none");
    });

    /**
     * Calls the updateSorterAndHtml function when clicking on the Update Store button on the modalStore
     */
    $("#updateSorterBtn").click(function () {
        updateSorterAndHtml();
    });

    /**
     * Calls the displaySorter function and rearanges the html elements for that store list when changes store on the modalStore
     */
    $("#sorter-modal-category-input").change(function () {
        const store = storeSelectOnStoreModal.val();
        localStorage.setItem("store", store);

        displaySorter();
        changeSorterValueInHtmlItemList();
        sortTable();
    });

    /**
     * Calls the sortTable function when clicking on the Sort button
     */
    $("#sortingBtn").click(function () {
        sortTable();
    });

    /**
     * Displays the message board modal
     */
    $("#profileBtn").click(function () {
        window.location.replace("/profile.html");
    });

    /**
     * Closes the message board modal
     */
    $("#okMessageBtn").click(function () {
        modalMessage.css("display", "none");
    });

    /**
     * Displays the logoutModal when clicking on the top left button on the main page.
     */
    $("#logutBtn").click(function () {
        modalLogout.css("display", "block");
    });

    /**
     * Empties the localStorage of the user and redirects to the login.html page when
     * clicking on the yes button on the logutModal.
     */
    $("#yesLogoutBtn").click(function () {
        localStorage.clear();
        window.location.replace("/login.html");
    });

    /**
     * Closes the logoutModal when clicking on the no button on the logoutModal.
     */
    $("#noLogoutBtn").click(function () {
        modalLogout.css("display", "none");
    });

    /**
     * Displays the modelCreateStore when clicking on Add new store + on he modalStores
     */
    $("#createSorterBtn").click(function () {
        modalCreateStore.css("display", "block");
    });

    /**
     * Closes the modalCreateStore when clicking on the X on the modalCreateStore
     */
    $("#create-store-modal-closer").click(function () {
        modalCreateStore.css("display", "none");
    });

    /**
     * Calls the sendNewStoreToDatabase function and closes the modalCreateStore when clicking on Create new store button on the modalCreateStore
     */
    $("#createNewStoreBtn").click(function () {
        sendNewStoreToDatabase();
        modalCreateStore.css("display", "none");
    });

    /**
     * Displays the modalRemoveStore and populates the text with the current store name when clicking on the Remove store button
     */
    $("#removeSorterBtn").click(function () {
        let store = storeSelectOnStoreModal.val();
        $("#removingStoreBanner").text(store);
        modalRemoveStore.css("display", "block");
    });

    /**
     * Calls the deleteCurrentSorter function and closes the modalRemoveStore when clicking on the Yes button on the modalRemoveStore
     */
    $("#yesRemoveStoreBtn").click(function () {
        deleteCurrentSorter();
        modalRemoveStore.css("display", "none");
    });

    /**
     * Closes the modalRemoveStore when clicking on the No button on the modalRemoveStore
     */
    $("#noRemoveStoreBtn").click(function () {
        modalRemoveStore.css("display", "none");
    });

    /**
     * Displays the modalChangeStoreName and populates the text with the current store name when clicking on the Rename store button
     */
    $("#renameSorterBtn").click(function () {
        let store = storeSelectOnStoreModal.val();
        $("#renameStoreBanner").text(store);
        modalChangeStoreName.css("display", "block");
    });

    /**
     * Closes the modalChangeStoreName when clicking on the X on the modalChangeStoreName
     */
    $("#rename-store-modal-closer").click(function () {
        modalChangeStoreName.css("display", "none");
    });

    /**
     * Calls the function updateSorterName when clicking on the Update store name button on the modalChangeStoreName
     */
    $("#updateSorterNameBtn").click(function () {
        updateSorterName();
    });

    // Functions ***********************************************************************************************************

    /**
     * Fetches the sorters from the database and sets the list to the variable sorter.
     * Then calls the setUpStoreChoices function and after then calls the function fetchCategories.
     */
    function fetchSorter() {
        fetch(`https://td-shoppinglist-backend.herokuapp.com/sorting/get/${user.id}`)
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
     * Function that loops thought the sorter list and checks if it exists in the beforehand empty store array.
     * This array will after this be used to append options to the selector where a store is selected on the modalStores.
     */
    function setUpStoreChoices() {
        const lastStore = localStorage.getItem("store");
        for (s of sorter) {
            if (!stores.includes(s.storeName)) {
                stores.push(s.storeName);
            }
        }

        for (store of stores) {
            storeSelectOnStoreModal.append(`
            <option class="option-input">
                ${store}
            </option> 
            `);
        }

        if (lastStore != null) {
            storeSelectOnStoreModal.val(lastStore);
        }
    }

    /**
     * Function that filter away all the sorters with the current selected storeName on the modalStores from the sorter array.
     * After this it loops through these selector element and removes the current storeName.
     * Then the function displaySorter is called and a call to the database it performed with the storeName to be removed and the user id.
     */
    function deleteCurrentSorter() {
        const store = storeSelectOnStoreModal.val();

        sorter = sorter.filter(function (value, index, arr) {
            return value.storeName != store;
        });

        storeSelectOnStoreModal.children().each(function () {
            if ($(this).val() == store) {
                $(this).remove();
            }
        });

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
                setAndDisplayAlertMessage("Could not delete sorters in database!");
            } else {
                const store = storeSelectOnStoreModal.val();
                localStorage.setItem("store", store);
                changeSorterValueInHtmlItemList();
                displaySorter();
                sortTable();
            }
        });
    }

    /**
     * Fetches the category array from the database and then calls the function setAndRenderCategories.
     * After this calls the function fetchItems.
     */
    function fetchCategories() {
        fetch("https://td-shoppinglist-backend.herokuapp.com/category/get")
            .then((response) => response.json())
            .then((data) => setAndRenderCategories(data))
            .then(() => fetchItems());
    }

    /**
     * Receives JSON data with categories and set assign it to the variable categories.
     * After this it loops through all the categories and calls the function renderCategory with each category
     * and the string "selected" when the category "Övrigt" is looped over to make this pre selected.
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
     * Function that receives one category object and a string to be appended
     * to the dropdown options meny for the categories on the add modal
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
     * Fetches the item array from the database with the specific user id.
     * Then calls the function setAndRenderItems with the item array.
     * After this it calls the function displaySorter and then the function sortTable.
     * After this it makes the three button Stores, Sort and Add + enabled for use.
     */
    function fetchItems() {
        fetch(`https://td-shoppinglist-backend.herokuapp.com/item/get/${user.id}`)
            .then(function (response) {
                $("#loadingMessageDiv").remove();
                return response.json();
            })
            .then((data) => setAndRenderItems(data))
            .then(() => displaySorter())
            .then(() => changeSorterValueInHtmlItemList())
            .then(() => sortTable())
            .then(function () {
                $("#storesBtn").removeAttr("disabled");
                $("#sortingBtn").removeAttr("disabled");
                $("#addBtn").removeAttr("disabled");
            });
    }

    /**
     * Receives JSON data with items and sets this to the variable array itemList.
     * Then it loops through the itemList and calls the function renderItem with each item
     * and a boolean depending on if this is rendered at the fetch of all items or when adding one item.
     * @param {JSON} itemDataArray
     */
    function setAndRenderItems(itemDataArray) {
        itemList = itemDataArray;

        // Sends each item to the item render function with true becouse this is on page load
        for (item of itemList) {
            renderItem(item, true);
        }
    }

    /**
     * Function that receives one item object and a boolean that if true appends else prepends the item to the list.
     * The function collects all the information required from the item such as color, categoryname, if item is checked.
     * Then it appends or prepends the item to the tableArea where all the items are shown with the item id, color,
     * sortvalue depending on the sorter, category name and item name.
     * After this Listeners for this item row and meny button on the right side is set.
     * @param {Object} item
     */
    function renderItem(item, onload) {
        const color = item.category.color;
        const lastStore = localStorage.getItem("store");

        let rowClasses;
        let sortvalue;

        // Checks the sort value from the sorter for the category and sets the html element value for later sorting
        for (s of sorter) {
            if (s.categoryName == item.category.name && s.storeName == lastStore) {
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
         * Listener that toggles whether an item is checked or not by toggle the class "checked-item" for the currenct element
         * when clicking on the element with the items id
         */
        $(`#${item.id}`).click(function () {
            const id = $(this).prop("id");
            $(this).toggleClass("checked-item");
            changeItemCheckedStatusInListForId(id);
        });

        /**
         * Listener for the start touch from the element with the item id
         * and saves it to the coordinate variables.
         */
        document.getElementById(`${item.id}`).addEventListener("touchstart", function (event) {
            touchStartX = event.changedTouches[0].screenX;
            touchStartY = event.changedTouches[0].screenY;
        });

        /**
         * Listener for the end touch from the element with the item id
         * and saves it to the coordinate variables.
         * After this the function deleteItemFromHtmlListById is called with the respective item id.
         */
        document.getElementById(`${item.id}`).addEventListener("touchend", function (event) {
            currentEditableItemId = `${item.id}`;
            touchEndX = event.changedTouches[0].screenX;
            touchEndY = event.changedTouches[0].screenY;
            deleteItemFromHtmlListById(`${item.id}`);
        });

        /**
         * Listener for the edit button for each element thats added to the item table list
         * and when clicked sets a variable with the current item id and then calls the function
         * setUpEditModal with the respective item id and displays the modalEdit.
         */
        $(`#edit${item.id}`).click(function () {
            currentEditableItemId = `${item.id}`;
            setUpEditModal(`${item.id}`);
            modalEdit.css("display", "block");
        });
    }

    /**
     * Function that receives an id of an item element and start by calculating the subraction of the coordinates
     * thats generated by the swiping on the element with that id.
     * Then it checks if the X axis has been swiped more the 100 px to the right and the Y axis less then 25 px up and down.
     * If this is true the parent element is removed and the function deleteItemFromDatabaseById is called.
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

    /**
     * Function that receives an id of an item and calls the database with this id to have it
     * removed from the database and alerts if anything goes wrong.
     * @param {Long} id
     */
    function deleteItemFromDatabaseById(id) {
        deleteItemFromVariableList(id);
        fetch(`https://td-shoppinglist-backend.herokuapp.com/item/delete/${id}`).then(function (
            response
        ) {
            if (response.status != 200)
                setAndDisplayAlertMessage("Something went wrong when deleting item from database!");
        });
    }

    /**
     * Function that takes an item id and removes it from the global item array itemList.
     * This to prevent duplicates when updating the itemList for checks.
     * @param {Long}} id
     */
    function deleteItemFromVariableList(id) {
        itemList = itemList.filter(function (item) {
            return item.id != id;
        });
    }

    /**
     * Function that displays the sorter from the current store choice.
     * It starts by sorting the entire sorters array after sorting value and then
     * clears the entire html list of sorters on the modalStores.
     * Then it loops through all the sorters and checks if a sorter has the correct
     * user id and the storeName is the same as the selected one.
     * If both these are true it is appended to the sortingtable with correct color, sortingvalue and id.
     */
    function displaySorter() {
        // Sorting the sorter to display the categories in correct order
        sorter.sort(function (a, b) {
            return a.sortValue - b.sortValue;
        });

        sortingtable.html("");
        const choice = storeSelectOnStoreModal.val();

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
                            class="form-control sorter-input-values"
                            value="${s.sortValue}"
                            max="6"
                            min="1"
                            >
                        </td>
                    </tr>
                    `);
            }
        }
    }

    /**
     * Function that updates the selected sorter object and then updates the html elements so sorting can be done on the item html list.
     * It starts by looping through the sorters to collect the input values for the new sorting values to the specific category.
     * Then for each it calls the function validateSorterInput and if it returns true, exits the function here otherwise it saves this
     * value to the sorter and also adds it to an empty array sortArray for later validating.
     * After this the function validateEntireSorter is called with the new sortArray and if it return true, exits the function here
     * otherwiese it calls the function updateSorterInDatabase and then
     * loops through the item html element and changes the value for the element so sorting can later be done.
     */
    function updateSorterAndHtml() {
        const store = storeSelectOnStoreModal.val();
        let sortArray = [];
        const oldSorter = JSON.parse(JSON.stringify(sorter)); // Deep copy of sorter array to revert back to if anything fails

        for (s of sorter) {
            if (s.storeName == store) {
                const sortvalue = $(`#${s.id}`).next().children("input.form-control").val();
                if (validateSorterInput(sortvalue)) {
                    sorter = oldSorter;
                    return;
                }
                s.sortValue = sortvalue;
                sortArray.push(sortvalue);
            }
        }

        if (validateEntireSorter(sortArray)) {
            setAndDisplayAlertMessage("Categories can't have the same value!");
            sorter = oldSorter;
            return;
        }

        const wentOkInDatabase = updateSorterInDatabase();

        if (wentOkInDatabase) {
            tableArea.children().each(function () {
                const category = $(this).children("td.row-item").attr("name");
                const sortvalue = getCorrectSortingValue(store, category);
                $(this).children("td.row-item").attr("value", sortvalue);
            });
        } else {
            sorter = oldSorter;
        }
    }

    /**
     * Function that updates the store name.
     * It starts by collecting the current name from the selector and the new name from the input.
     * Then it loops through the sorter and changes the name on the sorter with the old name to the new.
     * After this it loops through the html elements of the selector options and updates to the new name.
     * Then it closes the modalChangeStoreName and calls the function updateSorterInDatabase.
     */
    function updateSorterName() {
        const oldStore = storeSelectOnStoreModal.val();
        const newStore = renameStoreInputField.val();

        for (s of sorter) {
            if (s.storeName == oldStore) s.storeName = newStore;
        }

        storeSelectOnStoreModal.children().each(function () {
            if ($(this).val() == oldStore) {
                $(this).text(newStore);
            }
        });

        modalChangeStoreName.css("display", "none");

        updateSorterInDatabase();
    }

    /**
     * Function that checks if the new input is a valid value and returns true if it is not valid.
     * Value must be between 1 and 6.
     * @param {int} sortInputValue
     * @returns boolean
     */
    function validateSorterInput(sortInputValue) {
        if (sortInputValue.length < 1) {
            setAndDisplayAlertMessage("All categories must have input values!");
            return true;
        } else if (sortInputValue > categories.length) {
            setAndDisplayAlertMessage(`Value can't be higher then ${categories.length}!`);
            return true;
        } else if (sortInputValue < 1) {
            setAndDisplayAlertMessage("Value can't be 0 or lower!");
            return true;
        } else if (sortInputValue != Math.floor(sortInputValue)) {
            setAndDisplayAlertMessage("Value can't be a decimal number!");
            return true;
        } else return false;
    }

    /**
     * Function that checks the entire new sortervalues if there is any duplicates and return true if thats the case
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
     * by looping through the sorters and returns the sortingvalue based on the category and store name.
     * @param {String} store
     * @param {String} category
     * @returns sorting value from the sorter array
     */
    function getCorrectSortingValue(store, category) {
        for (s of sorter) {
            if (s.categoryName == category && s.storeName == store) return s.sortValue;
        }
    }

    /**
     * Function that toggles the checked status in the itemList
     * by looping through the items and changes the correct item by the given id.
     * Then it send that item to the database to update it there aswell.
     * @param {Long} id
     */
    function changeItemCheckedStatusInListForId(id) {
        let currentItem;
        for (item of itemList) {
            if (item.id == id) {
                currentItem = item;
                if (item.checked) item.checked = false;
                else item.checked = true;
                break;
            }
        }
        updateItemInDatabase(currentItem);
    }

    /**
     * Function that is used for simply updating an items checked status in the database.
     * @param {object} item
     */
    function updateItemInDatabase(item) {
        fetch("https://td-shoppinglist-backend.herokuapp.com/item/add", {
            method: "POST",
            body: JSON.stringify(item),
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (response) {
            if (response.status != 200) {
                setAndDisplayAlertMessage(
                    "Could not update item in the database!/nServer appears to be down..."
                );
            }
        });
    }

    /**
     * Function that populates the modal with the information from the item from the row you clicked on
     * by looping through the items and finds the item by the given id and populates the values for the
     * selector with the correct category and the input with the correct item name.
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
     * Function that udates a current item and the html element in the item list
     * by first checking the if the name has any input and exit the function here if there isn't any input.
     * Then it collects all the necessary information by first looping through the categories to get the
     * category id, and color by the choosen category name in the selector.
     * After this it loops through the sorter and collects the correct sortvalue.
     * Then it loops through the itemList to find the correct item and updates it with all the information.
     * After this is calls the function updateItemInDatabase and after that it changes the html elements by
     * the new item name, sortvalue, color and categoryname.
     * @returns Exits function if input field is empty.
     */
    function updateHtmlListItem() {
        const itemName = editInputField.val();
        if (itemName.length == 0) return; // if no content is typed in exit the function here

        const categoryName = categorySelectEditModal.val();
        const store = storeSelectOnStoreModal.val();
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
                sortvalue = s.sortValue;
                break;
            }
        }

        let currentItem;

        // Update the array and then the html list
        for (item of itemList) {
            if (item.id == currentEditableItemId) {
                item.name = itemName;
                item.category.id = categoryId;
                item.category.name = categoryName;
                item.category.color = color;
                currentItem = item;
                break;
            }
        }

        updateItemInDatabase(currentItem);

        // Changes the html element
        const itemElement = $(`#${currentEditableItemId}`);
        itemElement.text(itemName);
        itemElement.attr("value", sortvalue);
        itemElement.parent().css({ "background-color": `${color}` });
        itemElement.attr("name", categoryName);
    }

    /**
     * Function that updates the entire sorter in the database by sending the sorter array.
     * If anything goes wrong this is alerted.
     */
    function updateSorterInDatabase() {
        let wentOk;
        fetch("https://td-shoppinglist-backend.herokuapp.com/sorting/update", {
            method: "POST",
            body: JSON.stringify(sorter),
            headers: {
                "Content-type": "application/json",
            },
        }).then(function (response) {
            if (response.status == 200) {
                setAndDisplayAlertMessage("Successfully updates the store in the database!");
                ok = true;
            } else {
                setAndDisplayAlertMessage("Could not update the store in database!");
                ok = false;
            }
        });
        return wentOk;
    }

    /**
     * Function that creates a new store in the database by sending the new store name and user id
     * to the database. After this we get a new sorter list back from the database and calls the
     * function addNewStoreToHtmlList. If anything goes wrong this is alerted.
     */
    function sendNewStoreToDatabase() {
        const newSorterName = createNewStoreInputField.val();
        createNewStoreInputField.val("");

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
                    setAndDisplayAlertMessage("Could not create new store in database!");
                } else {
                    addNewStoreToHtmlList(data);
                }
            });
    }

    /**
     * Function that receives an array of sorters and adds these to the current sorter list with a loop.
     * After this it appends the store name for all these sorters to the selector on the storeSelectOnStoreModal.
     * @param {Array} newSorter
     */
    function addNewStoreToHtmlList(newSorter) {
        for (s of newSorter) {
            sorter.push(s);
        }

        storeSelectOnStoreModal.append(`
            <option class="option-input">
                ${newSorter[0].storeName}
            </option> 
        `);

        storeSelectOnStoreModal.val(newSorter[0].storeName);

        const store = storeSelectOnStoreModal.val();
        localStorage.setItem("store", store);

        changeSorterValueInHtmlItemList();
        displaySorter();
        sortTable();
    }

    /**
     * Function that first checks if the item names length is more than 1 chararacter.
     * After this it collects all the necessary information by looping thought the categories
     * to get the category id and color by the choosen category from the selector on the addModal.
     * Then creates and item which is sent to the sendItemToDatabase function.
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

    /**
     * Function that receives an item object and sends it to the database.
     * Back from the database we get an item with an id which is added to our itemList and then
     * passed to the renderItem function and after that calls the function resetAddInputValue.
     * If there is something wrong with the database this is alerted and the item is not added to the itemList.
     * @param {object} item
     */
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
                    setAndDisplayAlertMessage("Could not send item to database!");
                } else {
                    itemList.unshift(data);
                    renderItem(data, false);
                }
            })
            .then(() => resetAddInputValue());
    }

    /**
     * Function that resets the values in the addModals input and set the category selection to "Övrigt".
     */
    function resetAddInputValue() {
        addInputField.val("");
        $("#add-modal-category-input").val("Övrigt");
    }

    /**
     * Function that changes the sorting values of the html elements in the item list.
     */
    function changeSorterValueInHtmlItemList() {
        const store = storeSelectOnStoreModal.val();

        tableArea.children().each(function () {
            const category = $(this).children("td.row-item").attr("name");
            const sortvalue = getCorrectSortingValue(store, category);
            $(this).children("td.row-item").attr("value", sortvalue);
        });
    }

    /**
     * Function that takes a message and display the messagemodal with this message.
     * @param {String} message Message to be shown
     */
    function setAndDisplayAlertMessage(message) {
        alertMessage.html(message);
        modalMessage.css("display", "block");
    }

    /**
     * Function that sorts the elements in the item table by the sorting value
     * that has been given to the elements as value.
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

                // Switch places of two elements if they are in the wrong sort order and starts a new loop
                if (a.getAttribute("value") > b.getAttribute("value")) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    break;
                }
            }
        }
    }

    // Runs when loaded ****************************************************************************************************
    modalAdd = $("#add-modal-div"); // sets the modal for adding to a variable
    modalEdit = $("#edit-modal-div"); // sets the modal for editing to a variable
    modalStores = $("#sorter-modal-div"); // sets the modal for settings to a variable
    modalCreateStore = $("#new-sorter-modal-div"); // sets the modal for create new store to a varable
    modalRemoveStore = $("#remove-sorter-modal-div"); // set the modal for removing a store to a variable
    modalChangeStoreName = $("#rename-sorter-modal-div"); // set the modal for changing store name to a variable
    modalLogout = $("#logout-modal-div"); // set the modal for logout to a variable
    modalMessage = $("#message-modal-div"); // set the modal for message to a variable
    categorySelectAddModal = $("#add-modal-category-input"); // sets the option selector to a variable on the adding modal
    categorySelectEditModal = $("#edit-modal-category-input"); // sets the option selector to a variable on the editing modal
    storeSelectOnStoreModal = $("#sorter-modal-category-input"); // set the option selector to a variable on the setting modal
    addInputField = $("#addInput"); // sets the input field in the add modal to a variable
    editInputField = $("#editInput"); // sets the input field in the edit modal to a variable
    renameStoreInputField = $("#storeNameChangeInput"); // sets the input field for renaming store to a variable
    createNewStoreInputField = $("#createStoreNameInput"); // sets the input field for creating a new store to a variable
    tableArea = $("#tableArea"); // sets the item table to a variable
    sortingtable = $("#sortingtable"); // sets the sorters table to a variable
    alertMessage = $("#alertMessage"); // sets the alertmessage element to a variable
    fetchSorter(); // Call the sorter fetch function which is later linked to the remaining fetches
});

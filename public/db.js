
let db;

//create new db req for budgetDB database
const request = window.indexedDB.open("budgetDB", newVersion(0) );


// returns a new version incase of changes to onupgradeneeded
function newVersion (current){
    return parseInt(current +1);
};

request.onupgradeneeded = function (event) {
    // create object store called "BudgetStore" and set autoIncrement to true
    // store indexedDB obj in variable
    db = event.target.result;
    
    // check to see if there are any objStores in the budgetDB if not then create objStore
    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("budgetStore", { autoIncrement: true });
    };

};



// on success set db to the target result if online then check the indexedDB 
request.onsuccess = function (event) {
    db = event.target.result;
    console.log(db);

    if (navigator.onLine) {
        console.log("backend online~~~~")
        checkDatabase();
    }
};


// if error then console log err
request.onerror = function (event) {
    console.log(event.target.errorCode);
};

//save a transcation
function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    let transaction = db.transaction(['budgetStore'], "readwrite");
    // access your pending object store
    const store = transaction.objectStore("budgetStore");
    // add record to your store with add method.
    store.add(record);
}

// check indexedDB for data
function checkDatabase() {
    console.log('checking indexedDB');
    // open a transaction on your pending db
    let transaction = db.transaction(['budgetStore'], "readwrite");
    // access your pending object store
    const budget = transaction.objectStore("budgetStore");
    // get all records from store and set to a variable
    const getAll = budget.getAll();


    // on successfull request will get all items in the store and bulk add them to db when back online lines64-74
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((res) => {
                    // returns array of obj that were added---from line 70
                    console.log(res)
                    // if successful, open a transaction on your pending db
                    // access your pending object store
                    // clear all items in your store
                });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);
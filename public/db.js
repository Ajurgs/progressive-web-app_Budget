let db;

const request = window.indexedDB.open("BudgetDB",1);
// on upgradeNeeded
request.onupgradeneeded = function (e){
    db= e.target.result;
    db.createObjectStore("BudgetStore",{keyPath:"ID", autoIncrement:true})
}
// on Success
request.onsuccess = function (e){
    db = e.target.result;
    if(navigator.onLine){
        checkDatabase();
    }
}
// on error
request.onerror = function(event){
    console.log(event.target.errorCode);
}
// save a record to the database
function saveRecord(record){
    const transaction = db.transaction(["BudgetStore"],"readwrite");
    const budgetStore = transaction.objectStore("BudgetStore");
    budgetStore.add(record);
}
// check the local database 
function checkDatabase(){
    const transaction = db.transaction(["BudgetStore"],"readwrite");
    const budgetStore = transaction.objectStore("BudgetStore");
    // get all the entries
    const getAll = budgetStore.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length >0){
            // send the local data to the server database
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept:"application/json,text/plain,*/*",
                    "Content-Type":"application/json",
                }
            }).then((response) => response.json())
            .then(() =>{
                // clear the local database
                const transaction = db.transaction(["BudgetStore"],"readwrite");
                const budgetStore = transaction.objectStore("BudgetStore");
                const cursorRequest = budgetStore.openCursor();
                cursorRequest.onsuccess = e =>{
                    const cursor = e.target.result;
                    if(cursor){
                        budgetStore.delete(cursor.value.ID);
                        cursor.continue();
                    }
                }
            })
        }
    }
}

window.addEventListener("online",checkDatabase);
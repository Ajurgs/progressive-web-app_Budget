const { response } = require("express");

let db;

const request = window.indexedDB.open("BudgetDB",1);

request.onupgradeneeded = function (e){
    db= e.target.result;
    db.createObjectStore("BudgetStore",{keyPath:"ID", autoIncrement:true})
}

request.onsuccess = function (e){
    db = e.target.result;
    if(navigator.onLine){
        checkDatabase();
    }
}
request.onerror = function(event){
    console.log(event.target.errorCode);
}

function saveRecord(record){
    const transaction = db.transaction(["BudgetStore"],"readwrite");
    const budgetStore = transaction.objectStore("BudgetStore");
    budgetStore.add(record);
}

function checkDatabase(){
    const transaction = db.transaction(["BudgetStore"],"readwrite");
    const budgetStore = transaction.objectStore("BudgetStore");
    const getAll = budgetStore.getAll();

    getAll.onsuccess = function(){
        if(getAll.result.length >0){
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept:"application/json,text/plain,*/*",
                    "Content-Type":"application/json",
                }
            }).then((response) => response.json())
            .then(() =>{
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
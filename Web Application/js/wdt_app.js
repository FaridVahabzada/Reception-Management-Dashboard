/* ------------------------------------------------------------------------------------------------------------------------------- */
// Digital clock functionality
function digitalClock() {
    const date = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let d = date.getDate();
    let mth = date.getMonth();
    let y = date.getFullYear();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    mth = months[mth]; //changing "number" month value to the appropriate "string" month value
    h = addZero(h);
    m = addZero(m);
    s = addZero(s);

    // This line is inserted into the wdt_app.html file
    document.getElementById("digitalClock").innerHTML = "DATE " + d + " " + mth + " " + y + " TIME " + h + ":" + m + ":" + s;
    // Sets timer for the digitalClock function in an asynchronous fashion
    setTimeout(digitalClock, 1000);
};
digitalClock();

// Adding zero to "number" hour, minute or second  values less than 10
function addZero(i) {
    if(i < 10) {i = "0" + i};
    return i;
};

/* ------------------------------------------------------------------------------------------------------------------------------- */
// Classes using Inheritance for the relevant object creation
class Employee {
    constructor(jsObject) {
        this.name = jsObject.name.first,
        this.surname = jsObject.name.last
    };
};

class StaffMember extends Employee {
    constructor(jsObject) {
        super(jsObject),
        this.picture = jsObject.picture.thumbnail,
        this.email = jsObject.email,
        this.status = jsObject.status,
        this.outTime = jsObject.outTime,
        this.duration = jsObject.duration,
        this.expectedReturnTime = jsObject.expectedReturnTime
    };
    // This function takes user input minute value, index of the selected row, & selected row's ERT column value as its arguments
    staffMemberIsLate(userInput, rowIndex, selectedStaffERT) {
        let userInputInMilliSeconds = userInput * 60 * 1000;
        setTimeout(function() {myAlertStaff(rowIndex, selectedStaffERT)}, userInputInMilliSeconds); // Sets timer for the myAlertStaff function in an asynchronous fashion
    };
};

class DeliveryDriver extends Employee {
    constructor(jsObject) {
        super(jsObject),
        this.vehicle = jsObject.vehicle,
        this.telephone = jsObject.telephone,
        this.deliveryAddress = jsObject.deliveryAddress,
        this.returnTime = jsObject.returnTime
    };
    // This function takes user input Return Time, selected row data, & the array of driver objects as its arguments
    deliveryDriverIsLate(returnTime, selectedRowData, drivers) {
        let userInputArray = returnTime.split(":"); // Gets the array form of the Return Time with colon removed
        let parsedInputHours = parseInt(userInputArray[0]);
        let parsedInputMinutes = parseInt(userInputArray[1]);

        let currentDate = new Date();
        let hours = currentDate.getHours();
        let minutes = currentDate.getMinutes();
        let seconds = currentDate.getSeconds();

        let currentTime = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000; // Seconds are used for the estimated toast time accuracy
        let estimatedReturnTime = parsedInputHours * 60 * 60 * 1000 + parsedInputMinutes * 60 * 1000;

        let userInputInMilliSeconds;
        if(parsedInputHours == 0 && parsedInputMinutes == 0) { // If the Return Time input value is exactly at 00:00
            userInputInMilliSeconds = 24 * 60 * 60 * 1000 - currentTime;
        } else if(estimatedReturnTime > currentTime) { // If the Return Time input value is earlier than now
            userInputInMilliSeconds = estimatedReturnTime - currentTime;
        } else if(estimatedReturnTime < currentTime) { // If the Return Time input value is later than now
        userInputInMilliSeconds = 24 * 60 * 60 * 1000 - currentTime + estimatedReturnTime;
        };
    
        setTimeout(function() {myAlertDriver(selectedRowData, drivers)}, userInputInMilliSeconds); // Sets timer for the myAlertDriver function in an asynchronous fashion
    };
};

/* ------------------------------------------------------------------------------------------------------------------------------- */
// Making API call & converting response to JS class objects
var randomUsers;
var staffMembers;

function staffUserGet() {
    $.ajax({ // Ajax automatically converts the response to JS object
        url: 'https://randomuser.me/api/1.4/?results=5&inc=picture,name,email&noinfo',
        dataType: 'json',
        async: false,
        success: function(data) {
            randomUsers = data.results;
        }
    });
    
    return staffMembers = [
        new StaffMember(randomUsers[0]),
        new StaffMember(randomUsers[1]),
        new StaffMember(randomUsers[2]),
        new StaffMember(randomUsers[3]),
        new StaffMember(randomUsers[4])
    ];
};
window.onload = staffUserGet(); // On page load as required

// Populating the Staff table with the array of the objects received from the API response
function populateStaffTable(data) {
    var staffTableBody = document.getElementById("staffTableBody");
    
    for(let i = 0; i < data.length; i++) { // Changing the "undefined" cells
            while(typeof data[i].status === "undefined") {
                data[i].status = "In";
                data[i].outTime = "";
                data[i].duration = "";
                data[i].expectedReturnTime = "";
            };

        let row = `<tr>
                        <td><img class="rounded rounded-4" src="${data[i].picture}" alt="ID photo"></td>
                        <td>${data[i].name}</td>
                        <td>${data[i].surname}</td>
                        <td>${data[i].email}</td>
                        <td>${data[i].status}</td>
                        <td>${data[i].outTime}</td>
                        <td>${data[i].duration}</td>
                        <td>${data[i].expectedReturnTime}</td>
                    </tr>`;
        
        // New lines inserted into the wdt_app.html file
        staffTableBody.innerHTML += row;
    };
};
populateStaffTable(staffMembers);

/* ------------------------------------------------------------------------------------------------------------------------------- */
$("document").ready(function() { // When document is ready
    /* +++++++++++++++++++++++++++++++ Interactive buttons section +++++++++++++++++++++++++++++++ */
    var rowIndexST;

    // Makes the Staff table clickable
    $("#staffTableBody tr").click(function() {
        if(typeof rowIndexST !== "undefined") { // Only 1 row can be selected
            $("#staffTableBody tr").eq(rowIndexST).toggleClass("selected");
        };
        $(this).toggleClass("selected");
        rowIndexST = $(this).parent().children().index($(this)); // Index of the selected cell
    });

    // Makes the Staff table & the Schedule Delivery table highlighted on hover
    $("#staffTableBody tr, #scheduleDeliveryBody tr").hover(function() {
        $(this).toggleClass("highlighted");
    });

    // Makes the Add & Clear buttons change the CSS properties on hover
    $("#negativeClear, #positiveAdd").mouseenter(function() {
        $(this).animate({
            padding: 6,
            fontSize: 20
        }, "fast");
    });
    $("#negativeClear, #positiveAdd").mouseleave(function() {
        $(this).animate({
            padding: 5,
            fontSize: 16
        }, "fast");
    });

    // Makes the In & Out buttons BOTH change the CSS properties on hover
    $("span").hover(function() {
        $("#negativeOut, #positiveIn").toggleClass("hovered");
    });

    /* +++++++++++++++++++++++++++++++ IN/OUT & ADD/CLEAR button functionality section +++++++++++++++++++++++++++++++ */
    var tableStaffStatus;
    var tableStaffOutTime;
    var tableStaffDuration;
    var tableStaffERT; // ERT = Expected Return Time

    // OUT button is clickable & by clicking, the relevant staff members' object changes, & then the Staff table
    $("#negativeOut").click(function staffOut() {
        if($("#staffTableBody tr.selected").length != 0) { //Checking if any rows selected
            Swal.fire({
                title: "Enter out-time for <u>" + staffMembers[rowIndexST].name + "</u> in minutes:",
                input: "number",
                inputLabel: "Please enter a whole number:",
                inputPlaceholder: "Out-time in minutes",
                inputAttributes: {
                    min: "1",
                    max: "720",
                },
                showCancelButton: true,
                confirmButtonText: "Submit",
                allowOutsideClick: false,
                validationMessage: "Your input value is invalid! Please enter a digit between 1 and 720!", // If the input is outside the range
                preConfirm: (result) => { // If nothing was submitted
                    if(!result || result.trim() === "") {
                        Swal.showValidationMessage("Please enter a digit between 1 and 720!");
                    };
                },
            }).then(function(result) {
                if(result.value) { // If the input is valid
                    const dateOut = new Date();
                    const inputMinutes = parseInt(result.value);

                    tableStaffStatus = $("#staffTableBody tr.selected td:nth-child(5)");
                    tableStaffOutTime = $("#staffTableBody tr.selected td:nth-child(6)");
                    tableStaffDuration = $("#staffTableBody tr.selected td:nth-child(7)");
                    tableStaffERT = $("#staffTableBody tr.selected td:nth-child(8)");

                    staffMembers[rowIndexST].status = "Out";
                    staffMembers[rowIndexST].outTime = timeOut(dateOut);
                    staffMembers[rowIndexST].duration = correctFormat(inputMinutes);
                    staffMembers[rowIndexST].expectedReturnTime = addMinutes(dateOut, inputMinutes);

                    Swal.fire({
                        icon: "success",
                        title: "Done!",
                        showConfirmButton: false,
                        allowOutsideClick: true,
                        timer: 1000,
                    });

                    tableStaffStatus.fadeOut(500, function() {
                        $(this).text(staffMembers[rowIndexST].status).fadeIn(500);
                    });
                    tableStaffOutTime.fadeOut(500, function() {
                        $(this).text(staffMembers[rowIndexST].outTime).fadeIn(500);
                    });
                    tableStaffDuration.fadeOut(500, function() {
                        $(this).text(staffMembers[rowIndexST].duration).fadeIn(500);
                    });
                    tableStaffERT.fadeOut(500, function() {
                        $(this).text(staffMembers[rowIndexST].expectedReturnTime).fadeIn(500);
                    });

                    // The toast notification functionality is activated for the staff member 
                    var selectedStaffERT = staffMembers[rowIndexST].expectedReturnTime;
                    staffMembers[rowIndexST].staffMemberIsLate(inputMinutes, rowIndexST, selectedStaffERT);
                    /* Before the staffMemberIsLate() function added as a method to the StaffMember Class, how the line above looked like: */
                    /* staffMemberIsLate(inputMinutes, rowIndexST, selectedStaffERT); */
                };
            });
        } else { // When staff member is not selected
            Swal.fire({
                icon: "warning",
                iconColor: "#EE4B2B",
                title: "Please, select a staff member first!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        };
    });

    // IN button is clickable & by clicking, the relevant staff members' object changes, & then the Staff table
    $("#positiveIn").click(function staffIn() {
        if($("#staffTableBody tr.selected").length == 0) { // When staff member is not selected
            Swal.fire({
                icon: "warning",
                iconColor: "#EE4B2B",
                title: "Please, select a staff member first!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        } else if(staffMembers[rowIndexST].status == "In") { // Checks if the Status is IN
            Swal.fire({
                icon: "warning",
                iconColor: "#EE4B2B",
                title: "Please, select a staff member with a different status!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        } else { // When everything is OK
            staffMembers[rowIndexST].status = "In";
            staffMembers[rowIndexST].outTime = "";
            staffMembers[rowIndexST].duration = "";
            staffMembers[rowIndexST].expectedReturnTime = "";

            Swal.fire({
                icon: "success",
                title: "Done!",
                showConfirmButton: false,
                allowOutsideClick: true,
                timer: 1000,
            });

            tableStaffStatus.fadeOut(500, function() {
                $(this).text(staffMembers[rowIndexST].status).fadeIn(500);
            });
            tableStaffOutTime.fadeOut(500, function() {
                $(this).text(staffMembers[rowIndexST].outTime).fadeIn(500);
            });
            tableStaffDuration.fadeOut(500, function() {
                $(this).text(staffMembers[rowIndexST].duration).fadeIn(500);
            });
            tableStaffERT.fadeOut(500, function() {
                $(this).text(staffMembers[rowIndexST].expectedReturnTime).fadeIn(500);
            });
        };
    });

    const deliveryDrivers = []; // This is the array where all the driver objects will be placed

    // ADD button is clickable & by clicking, the validation is carried out for the input values, & then the Delivery Board table is populated
    $("#positiveAdd").click(function addDelivery() {
        let userInputs = document.forms["myForm"];
        let missingInputs = []; // This is the array where all the missing inputs will be placed
        var missingInputsString;

        if(userInputs[0].value == "selectType") { // Checks if the vehicle type is NOT selected
            missingInputs.push(userInputs[0].name);
            missingInputsString = missingInputs.join(", ");
        };

        for(let i = 1; i < userInputs.length; i++) {
            if(userInputs[i].value == "") { // Checks if all the inputs except the vehicle type is empty
                missingInputs.push(userInputs[i].name);
                missingInputsString = missingInputs.join(", "); // Converting the missing inputs to the string form
            };
        };

        // If any validation messages are present from the previous entry, they will be removed
        $("#nameCell div").remove();
        $("#surnameCell div").remove();
        $("#telephoneCell div").remove();
        $("#deliveryAddressCell div").remove();

        if(missingInputs.length > 1) { // Checks if there are more than 1 missing inputs registered
            Swal.fire({
                icon: "error",
                iconColor: "#EE4B2B",
                title: "Oops!",
                html: "<b>" + missingInputsString + "</b> fields are required!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        } else if(missingInputs.length = 1 && typeof missingInputs[0] !== "undefined") { // If only 1 missing input is registered
            Swal.fire({
                icon: "error",
                iconColor: "#EE4B2B",
                title: "Oops!",
                html: "<b>" + missingInputsString + "</b> field is required!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        } else if(validateDelivery()) { // If no missing inputs & the validation function detects invalid entries
            Swal.fire({
                icon: "error",
                iconColor: "#EE4B2B",
                title: "One or more invalid entries!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        } else if(testUniqueness(deliveryDrivers)) { // If this driver already exists in the Delivery Board table
            Swal.fire({
                icon: "error",
                iconColor: "#EE4B2B",
                title: "This driver has already been added!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });

            // Input boxes are emptied
            clearInputs();
        } else { // If no missing inputs & the validation function says everything is OK
            // A new driver object instance is created & randomUsers[0] from the API response is used to obey the Employee class's name & surname conventions
            let driverInstance = new DeliveryDriver(randomUsers[0]);

            // The driver object instance properties are changed by the appropriate input entries
            driverInstance.name = document.getElementById("name").value;
            driverInstance.surname = document.getElementById("surname").value;
            driverInstance.vehicle = document.getElementById("vehicleType").value;
            driverInstance.telephone = document.getElementById("telephone").value;
            driverInstance.deliveryAddress = document.getElementById("deliveryAddress").value;
            driverInstance.returnTime = document.getElementById("returnTime").value;
            
            deliveryDrivers.push(driverInstance); // The array object is filled with the object instance created

            // Input boxes are emptied
            clearInputs();

            Swal.fire({
                icon: "success",
                title: "Delivery for <u>" + driverInstance.returnTime + "</u> added!",
                showConfirmButton: false,
                allowOutsideClick: true,
                timer: 1500,
            });
            
            // The Delivery Board table is being populated by the last array object
            populateDeliveryBoard(deliveryDrivers);
            // The Delivery Board table header's left & right bottom corners are NOT rounded anymore
            deliveryBoardJustHeader();
            // The Delivery Board table can now be highlighted & selected accordingly
            higlightSelect();

            // The toast notification functionality is activated for the driver
            driverInstance.deliveryDriverIsLate(driverInstance.returnTime, driverInstance, deliveryDrivers);
            /* Before the deliveryDriverIsLate() function added as a method to the DeliveryDriver Class, how the line above looked like: */
            /* deliveryDriverIsLate(driverInstance.returnTime, driverInstance, deliveryDrivers); */
        };
    });

    // CLEAR button is clickable & by clicking, the Delivery Board table row & the relavant object in the array of the objects will be removed
    $("#negativeClear").click(function clearDelivery() {
        if($("#deliveryBoardBody tr").length == 0) { // Checks if the Delivery Board table has NO rows
            Swal.fire({
                icon: "warning",
                iconColor: "#EE4B2B",
                title: "Please, add a delivery driver first!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        } else if($("#deliveryBoardBody tr.selected").length == 0) { // Checks if the Delivery Board table row is selected
            Swal.fire({
                icon: "warning",
                iconColor: "#EE4B2B",
                title: "Please, select a delivery driver first!",
                confirmButtonText: "Okay",
                allowOutsideClick: false,
            });
        } else { // If everyting is OK
            Swal.fire({
                icon: "question",
                title: "Are you sure?",
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: "Yes",
                denyButtonText: "No",
              }).then((result) => {
                if(result.isConfirmed) { // If the row should be deleted
                    Swal.fire({
                        icon: "success",
                        title: "Done!",
                        showConfirmButton: false,
                        allowOutsideClick: true,
                        timer: 1500,
                    });

                    // The relevant object is removed from the array of the objects
                    deliveryDrivers.splice($("#deliveryBoardBody tr.selected").index(), 1);
                    // The relevant Delivery Board table row is deleted
                    $("#deliveryBoardBody tr.selected").fadeIn(500, function() {
                      $(this).remove();
                    });
                } else if(result.isDenied) { // If the row should be kept as it is
                    Swal.fire({
                        icon: "warning",
                        iconColor: "#7DF9FF",
                        title: "Nothing was changed!",
                        showConfirmButton: false,
                        allowOutsideClick: true,
                        timer: 1500,
                    });
                };
            });
        };
    });
});

/* ------------------------------------------------------------------------------------------------------------------------------- */
/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Functions Used In The Staff Table +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

// This function returns correct format for the Out Time column value based on the current date
function timeOut(dateNow) {
    let hour = dateNow.getHours();
    let min = dateNow.getMinutes();
    hour = addZero(hour);
    min = addZero(min);
    return hour + " : " + min;
};

// This function returns correct format for the Duration column value based on the user input minute values
function correctFormat(userInput) {
    let hour = Math.floor(userInput / 60);
    let min = userInput;
    if(userInput >= 60) { // If the user input minutes are more than or equal to 60 minutes
        min %= 60;
    };
    return hour + " hr : " + min + " min";
};

// This function returns correct format for the ERT column value based on the user input minute values & current date
function addMinutes(dateNow, userInput) {
    let dateNowInMilliseconds = dateNow.getTime();
    let userInputInMilliSeconds = userInput * 60 * 1000;
    let addedMinutesDate = new Date(dateNowInMilliseconds + userInputInMilliSeconds);
    let hour = addedMinutesDate.getHours();
    let min = addedMinutesDate.getMinutes();
    hour = addZero(hour);
    min = addZero(min);
    return hour + " : " + min;
};

/* ---------------------------- Here originally staffMemberIsLate() function was located! Now it is StaffMember class method! ---------------------------- */
/*// This function takes user input minute value, index of the selected row, & selected row's ERT column value as its arguments
function staffMemberIsLate(userInput, rowIndex, selectedStaffERT) {
    let userInputInMilliSeconds = userInput * 60 * 1000;
    setTimeout(function() {myAlertStaff(rowIndex, selectedStaffERT)}, userInputInMilliSeconds); // Sets timer for the myAlertStaff function in an asynchronous fashion
};*/
/* ----------------------------------------------------------------------------------------------------------------------------------------------- */

// This function takes index of the selected row & selected row's ERT column value as its arguments, then returns a toast notification
function myAlertStaff(rowIndex, selectedStaffERT) {
    if(staffMembers[rowIndex].status == "In" || selectedStaffERT !== staffMembers[rowIndex].expectedReturnTime) {
        return false;
    } else { // If the Status is NOT IN & selected row's ERT value is same as the relevant object
        let newLines = `<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                            <div class="toast-header">
                                <strong class="me-auto" style="color: #B22222;">Staff Delay Alert!</strong>
                                <i class="bi bi-bell-fill"></i>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">
                                <p>
                                    <img class="rounded rounded-2" src="${staffMembers[rowIndex].picture}" alt="ID photo">
                                    &nbsp;<u><b>${staffMembers[rowIndex].name} ${staffMembers[rowIndex].surname}</b></u> is delayed.
                                </p>
                                <p>
                                    Time out-of-office: <b>${staffMembers[rowIndex].duration}</b>
                                </p>
                            </div>
                        </div>`;

        // New lines inserted into the wdt_app.html file
        document.getElementById("toastsAddHere").innerHTML += newLines;
        // Only show the last toast notification
        $("#toastsAddHere .toast:last").toast("show");
    };
};

/* ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Functions Used In The Delivery Board Table ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

// This function populates the Delivery Board table with the array object added
function populateDeliveryBoard(data) {
    var deliveryBoardBody = document.getElementById("deliveryBoardBody");
    
    let i = data.length - 1; // For the last array object index
    let row = `<tr>
                    <td>${data[i].vehicle}</td>
                    <td style="word-wrap: break-word; text-transform: capitalize;">${data[i].name}</td>
                    <td style="word-wrap: break-word; text-transform: capitalize;">${data[i].surname}</td>
                    <td style="word-wrap: break-word;">${data[i].telephone}</td>
                    <td style="word-wrap: break-word; text-transform: capitalize;">${data[i].deliveryAddress}</td>
                    <td>${data[i].returnTime}</td>
                </tr>`;

    // New lines inserted into the wdt_app.html file
    deliveryBoardBody.innerHTML += row;
};

/* ---------------------------- Here originally deliveryDriverIsLate() function was located! Now it is DeliveryDriver class method! ---------------------------- */
/*// This function takes user input Return Time, selected row data, & the array of driver objects as its arguments
function deliveryDriverIsLate(returnTime, selectedRowData, drivers) {
    let userInputArray = returnTime.split(":"); // Gets the array form of the Return Time with colon removed
    let parsedInputHours = parseInt(userInputArray[0]);
    let parsedInputMinutes = parseInt(userInputArray[1]);

    let currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();
    
    let currentTime = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000; // Seconds are used for the estimated toast time accuracy
    let estimatedReturnTime = parsedInputHours * 60 * 60 * 1000 + parsedInputMinutes * 60 * 1000;

    let userInputInMilliSeconds;
    if(parsedInputHours == 0 && parsedInputMinutes == 0) { // If the Return Time input value is exactly at 00:00
        userInputInMilliSeconds = 24 * 60 * 60 * 1000 - currentTime;
    } else if(estimatedReturnTime > currentTime) { // If the Return Time input value is earlier than now
        userInputInMilliSeconds = estimatedReturnTime - currentTime;
    } else if(estimatedReturnTime < currentTime) { // If the Return Time input value is later than now
        userInputInMilliSeconds = 24 * 60 * 60 * 1000 - currentTime + estimatedReturnTime;
    };
    
    setTimeout(function() {myAlertDriver(selectedRowData, drivers)}, userInputInMilliSeconds); // Sets timer for the myAlertDriver function in an asynchronous fashion
};*/
/* ------------------------------------------------------------------------------------------------------------------------------------------------------------- */

// This function takes selected row data & the array of driver objects as its arguments
function myAlertDriver(selectedRowData, drivers) {
    if(!drivers.includes(selectedRowData)) {
        return false;
    } else { // If selected row data does match with any of the driver objects in the array
        let newLines = `<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
                            <div class="toast-header">
                                <strong class="me-auto" style="color: #B22222;">Delivery Driver Delay Alert!</strong>
                                <i class="bi bi-bell-fill"></i>
                                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                            </div>
                            <div class="toast-body">
                                <p>
                                    Name: <u><b>${selectedRowData.name} ${selectedRowData.surname}</b></u> is delayed.<br>
                                    Address: <b>${selectedRowData.deliveryAddress}</b><br>
                                    Telephone: <b>${selectedRowData.telephone}</b><br>
                                </p>
                                <p>
                                    Estimated return time: <b>${selectedRowData.returnTime}</b>
                                </p>
                            </div>
                        </div>`;
        // New lines inserted into the wdt_app.html file
        document.getElementById("toastsAddHere").innerHTML += newLines;
        // Only show the last toast notification
        $("#toastsAddHere .toast:last").toast("show");
    };
};

// This function clears the Schedule Delivery table input box entries
function clearInputs() {
    document.getElementById("vehicleType").value = "selectType";
    document.getElementById("name").value = "";
    document.getElementById("surname").value = "";
    document.getElementById("telephone").value = "";
    document.getElementById("deliveryAddress").value = "";
    document.getElementById("returnTime").value = "";
};

// This function adds (OR removes) curves from the Delivery Board table header's bottom left & right corners when NO rows are present (OR when rows are present)
function deliveryBoardJustHeader() {
    if($("#deliveryBoardBody tr").length == 0) { // If the Delivery Board has NO rows
        $("#deliveryBoardHeader tr th:first-child").css("border-bottom-left-radius", "5px");
        $("#deliveryBoardHeader tr th:last-child").css("border-bottom-right-radius", "5px");
    } else {
        $("#deliveryBoardHeader tr th:first-child").css("border-bottom-left-radius", "0px");
        $("#deliveryBoardHeader tr th:last-child").css("border-bottom-right-radius", "0px");
    };
};
deliveryBoardJustHeader();

// This function allows to highlight rows on hover & select one row if clicked
function higlightSelect() {
    // For highlighting a row on hover
    $("#deliveryBoardBody tr").hover(function() {
        $(this).toggleClass("highlighted");
    });
    
    // For selecting one row when clicked
    $("#deliveryBoardBody tr").click(function() {
        if($("#deliveryBoardBody tr.selected").length != 0) { // Only 1 row can be selected
            $("#deliveryBoardBody tr").eq($("#deliveryBoardBody tr.selected").index()).toggleClass("selected");
        };
        $(this).toggleClass("selected");
    });
};

// This function helps with the validation of the Name, Surname, Telephone & Delivery Address input box entries
function validateDelivery() {
    let inputName = document.getElementById("name").value;
    let inputSurname = document.getElementById("surname").value;
    let inputTelephone = document.getElementById("telephone").value;
    let inputdeliveryAddress = document.getElementById("deliveryAddress").value;

    let validationVariable = false; // Equalling the validation variable value to the Boolean FALSE

    if(inputName.length < 2 || !/^([a-zA-Z]+)([-\s\'][a-zA-Z]+)*$/.test(inputName)) { // If Name length is less than 2 OR does NOT follow the required name rule
        // New line inserted into the wdt_app.html file
        $("#nameCell").append(`<div style="color: red; font-size: 14px;">Name must be at least <b>2 letters</b> with 1 special character (
                                <span style="color: green; font-weight: bold;">-</span>;
                                &nbsp;;
                                <span style="color: green; font-weight: bold;">'</span>
                                ) in between!
                               </div>`
        );
        validationVariable = true; // The validation variable value changed to the Boolean TRUE
    };
    if(inputSurname.length < 2 || !/^([a-zA-Z]+)([-\s\'][a-zA-Z]+)*$/.test(inputSurname)) { // If Surname length is less than 2 OR does NOT follow the required surname rule
        // New line inserted into the wdt_app.html file
        $("#surnameCell").append(`<div style="color: red; font-size: 14px;">Surname must be at least <b>2 letters</b> with 1 special character (
                                    <span style="color: green; font-weight: bold;">-</span>;
                                    &nbsp;;
                                    <span style="color: green; font-weight: bold;">'</span>
                                    ) in between!
                                  </div>`
        );
        validationVariable = true; // The validation variable value changed to the Boolean TRUE
    };
    if(!/^[0-9]{8,}$/.test(inputTelephone)) { // If Telephone length does NOT follow the required phone number rule
        // New line inserted into the wdt_app.html file
        $("#telephoneCell").append(`<div style="color: red; font-size: 14px;">Please enter at least <b>8 digits</b>!</div>`);
        validationVariable = true; // The validation variable value changed to the Boolean TRUE
    };
    if(inputdeliveryAddress.length < 4 || !/^([a-zA-Z0-9]+)([,#-\/\s\'][a-zA-Z0-9]+)*$/.test(inputdeliveryAddress)) { // If Delivery Address length is less than 4 OR does NOT follow the required address rule
        // New line inserted into the wdt_app.html file
        $("#deliveryAddressCell").append(`<div style="color: red; font-size: 14px;">Delivery Address must be at least <b>4 digits or letters</b> with 1 special character (
                                            <span style="color: green; font-weight: bold;">-</span>;
                                            &nbsp;;
                                            <span style="color: green; font-weight: bold;">'</span>;
                                            <span style="color: green; font-weight: bold;">,</span>;
                                            <span style="color: green; font-weight: bold;">#</span>;
                                            <span style="color: green; font-weight: bold;">/</span>
                                            ) in between!
                                          </div>`
        );
        validationVariable = true; // The validation variable value changed to the Boolean TRUE
    };
    return validationVariable; // The validateDelivery() function returns a Boolean validation variable value
};

// This function checks for the uniqueness of the Name, Surname, Telephone & Delivery Address input box entries
function testUniqueness(drivers) {
    let inputName = document.getElementById("name").value.toLowerCase();
    let inputSurname = document.getElementById("surname").value.toLowerCase();
    let inputTelephone = document.getElementById("telephone").value;
    let inputdeliveryAddress = document.getElementById("deliveryAddress").value.toLowerCase();

    let uniquenessVariable = false; // Equalling the uniqueness variable value to the Boolean FALSE
    
    if($("#deliveryBoardBody tr").length !== 0) { // If the Delivery Board has rows
        for(let i = 0; i < drivers.length; i++) { // Running a loop through the array of the objects
            if(drivers[i].name.toLowerCase() == inputName &&
               drivers[i].surname.toLowerCase() == inputSurname &&
               drivers[i].telephone == inputTelephone &&
               drivers[i].deliveryAddress.toLowerCase() == inputdeliveryAddress) { // If ALL this conditions are TRUE
                return uniquenessVariable = true; // The uniqueness variable value changed to the Boolean TRUE
            };
        };
    };
    return uniquenessVariable; // The testUniqueness() function returns a Boolean validation variable value
};

/* ------------------------------------------------------------------------------------------------------------------------------- */
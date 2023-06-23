// Menu button toogle
document.getElementById("menuButton").addEventListener("click", function () {
    var popupMenu = document.getElementById("popupMenu");
    if (popupMenu.classList.contains("hidden")) {
        popupMenu.classList.remove("hidden");
    } else {
        popupMenu.classList.add("hidden");
    }
});

// manage the dark mode
const toggle = document.getElementById('toggle');
const htmlElement = document.documentElement;

toggle.addEventListener('change', function () {
    if (toggle.checked) {
        htmlElement.classList.add('dark');
        console.log("dark");
    } else {
        htmlElement.classList.remove('dark');
        console.log("dark_remove");
    }
});


//Composter level -----------------------------------------------------------


let start_lv; // global scope

//get lv data from the server
async function getLvData() {
    try {
        const res = await fetch('https://api.skyblockdata.fr/lv');
        const start = await res.json(); //need a global variable to store the data
        const properties = ['speed', 'multiDrop', 'fuel', 'biomass', 'c_Reduction']; // list of properties to update

        properties.forEach(property => {
            document.getElementById(property).textContent = property.charAt(0).toUpperCase() + property.slice(1) + " level : " + start[property];
            const inputElement = document.getElementById(property + 'Input');
            inputElement.placeholder = start[property];  // set data as placeholder
            inputElement.addEventListener('focus', function() {
                this.value = start[property];  // set data as value when input is focused
            });
        });
        return start;
    } catch (err) {
        console.error(err);
        alert("Error getting data from server for lv.");
    }
};

// Call the async function and assign the result to start_lv
async function assignLvData() {
    start_lv = await getLvData();
}

// Initiate the process
assignLvData();

//verify if the input is valid and assign it to variable
function Form_Data() {

    // Get form values
    let New_speed = document.getElementById('speedInput').value;
    let New_multiDrop = document.getElementById('multiDropInput').value;
    let New_fuel = document.getElementById('fuelInput').value;
    let New_biomass = document.getElementById('biomassInput').value;
    let New_c_Reduction = document.getElementById('c_ReductionInput').value;

    //if the input is empty, use the placeholder
    if (New_speed == "") {
        New_speed = start_lv.speed;
    } 
    if (New_multiDrop == "") {
        New_multiDrop = start_lv.multiDrop;
    } 
    if (New_fuel == "") {
        New_fuel = start_lv.fuel;
    }
    if (New_biomass == "") {
        New_biomass =  start_lv.biomass;
    } 
    if (New_c_Reduction == "") {
        New_c_Reduction = start_lv.c_Reduction;
    }


    // new_lv object
    let new_lv = {
        speed: New_speed,
        multi_drop: New_multiDrop,
        fuel: New_fuel,
        biomass: New_biomass,
        c_reduction: New_c_Reduction
    };
    console.log(new_lv);
    return new_lv;
};

// Function to send data to the server
async function handleClick() {
    // Get form data
    let answer = Form_Data();

    // Send a POST request to the server
    try {
        let response = await fetch('https://api.skyblockdata.fr/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(answer),
        });


        let result = await response.json();
        if (response.ok) {  // Check if HTTP status code is 200-299
            console.log('Success:', result);
            alert("Success : " + result.message);
        } else {
            console.log('Error:', result);
            alert("Error : " + result.message);s
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Error :" + error);
    }
};


//Submit button event listener
document.getElementById('submitButton').addEventListener('click', handleClick);








//Timer -----------------------------------------------------------


//initialize the timer
let countdown;
let countdownInterval;

//get the timer from the server
async function getTimer() {

    // Clear first timer if it exists
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    try {
        const res = await fetch('https://api.skyblockdata.fr/timer');
        const data = await res.json();
        return data.timer;
    } catch (err) {
        console.error(err);
        alert("Error getting data from server for timer");
    }
};

//display the timer
function displayTimeLeft(seconds) {
    seconds = Math.round(seconds); // Round seconds to nearest whole number
    if (seconds <= 0) {
        document.getElementById('timer-display').textContent = "00:00:00";
        return; // Ensure no further execution in this function
    }
    const hours = Math.floor(seconds / 3600);
    const remainderMinutes = Math.floor((seconds % 3600) / 60);
    const remainderSeconds = seconds % 60;
    const display = `${hours}:${remainderMinutes < 10 ? '0' : ''}${remainderMinutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
    document.title = display;
    document.getElementById('timer-display').textContent = display;
};

//define start the timer
async function timer() {
    countdown = await getTimer();

    countdownInterval = setInterval(() => {
        countdown -= 1;
        console.log(countdown, countdown % 60);


        // Synchronise User each minutes
        if (countdown % 60 === 0) {
            countdown = timer(); // Directly update the countdown without calling timer()
        }

        if (countdown < 1 && countdown >= -2) {

            // Play a sound when the timer reaches zero
            new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3').play();

            setTimeout(function () {
                document.title = 'Timer Finished!';
            }, 1000); // Delay the title change by 1 second to ensure it takes effect
        }

        displayTimeLeft(countdown);
    }, 1000);
};

//reset the timer
function resetTimer() {
    fetch('https://api.skyblockdata.fr/reset', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
            countdown = data.timer;
            displayTimeLeft(countdown);
        })
        .catch((err) => {
            console.error(err);
            alert("Error resetting timer");
        });
};

//event listeners
document.getElementById('reset-button').addEventListener('click', resetTimer);

//start the timer
timer();

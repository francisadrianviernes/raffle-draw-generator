    let names = [];
    let raffleInterval;
    let winnerAnnounced = false;
    const fireworksDuration = 3000; // Set the duration to 3000 milliseconds (3 seconds)
    let canvas;
    let ctx;
    let audio; // Declare a variable to store the audio object globally

// Define a global variable to track the toggle state
let isSoundOn = false;

// JavaScript for the toggle sound switch
document.addEventListener('DOMContentLoaded', function() {
    const toggleSoundSwitch = document.getElementById('audioToggle');

    // Event listener for changes in the toggle switch state
    toggleSoundSwitch.addEventListener('change', function() {
        // Update the global variable based on the switch state
        isSoundOn = toggleSoundSwitch.checked;
    });
});


    
    function addName() {
        const nameInput = document.getElementById("nameInput");
        const name = nameInput.value.trim();
        if (name !== "") {
            names.push(name);
            nameInput.value = "";
            displayNames();
        }
    }

    function addNameOnEnter(event) {
        if (event.key === "Enter") {
            addName();
        }
    }

    function displayNames() {
        const raffleBoard = document.getElementById("raffleBoard");
        raffleBoard.innerHTML = "";
        names.forEach(name => {
            const card = document.createElement("div");
            card.textContent = name;
            card.classList.add("card");
            raffleBoard.appendChild(card);
        });
    }

    function uploadCSV(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const contents = e.target.result;
            const rows = contents.split('\n');
            names = []; // Clear existing names
            rows.forEach(row => {
                const columns = row.split(',');
                if (columns.length > 0) {
                    const name = columns[0].trim();
                    if (name !== "") {
                        names.push(name);
                    }
                }
            });
            displayNames();
        };
        
        reader.readAsText(file);
    }
    

    function startRaffle() {
        const startRaffleButton = document.getElementById("startRaffleButton");
        startRaffleButton.disabled = true; // Disable the button immediately upon click

        const winnerDisplay = document.getElementById("winner");
        const winnerNameDisplay = document.getElementById("winnerName");

        if (names.length > 0) {
            clearInterval(raffleInterval);
            let counter = 0;
            const totalFrames = 100;
            const duration = 5000;
            const speed = Math.floor(duration / totalFrames);
            const frames = [];
            for (let i = 0; i < totalFrames; i++) {
                const randomIndex = Math.floor(Math.random() * names.length);
                frames.push(names[randomIndex]);
            }
            raffleInterval = setInterval(() => {
                if (counter < totalFrames) {
                    const currentName = frames[counter % totalFrames];
                    const cards = document.querySelectorAll('.card');
                    cards.forEach(card => card.style.backgroundColor = "");
                    const highlightedCardIndex = counter % names.length;
                    const highlightedCard = cards[highlightedCardIndex];
                    highlightedCard.style.backgroundColor = "yellow";
                    winnerDisplay.style.display = "flex"; // Ensure winner card is displayed before updating content
                    winnerNameDisplay.textContent = currentName; // Update the winner name display with the current name
                    counter++;
                } else {
                    clearInterval(raffleInterval);
                    const randomIndex = Math.floor(Math.random() * names.length);
                    const winnerName = names[randomIndex];
                    winnerNameDisplay.textContent = winnerName;
                    startFireworks(winnerName); // Call startFireworks with the winner's name
                    if (isSoundOn) {
                        const audio = new Audio('congratulatory.mp3'); // Load the congratulatory sound
                        audio.play(); // Play the congratulatory sound when the winnerName is updated
                    }
                }
            }, speed);

        } else {
            alert("No names entered!");
            startRaffleButton.disabled = false; // Enable the button if there are no names entered
        }
    }




    function startFireworks(winnerName) {
        const colors = ["red", "blue", "green", "yellow", "purple", "cyan", "orange"];
        loopFireworksColors(colors, winnerName);
    }

    function loopFireworksColors(colors, winnerName) {
        if (colors.length === 0) {
            showCongratulatoryMessage(winnerName);
        } else {
            const color = colors.shift();
            startFireworksColor(color);
            setTimeout(() => loopFireworksColors(colors, winnerName), 500);
        }
    }

    function showCongratulatoryMessage(winnerName) {
        const fireworksPopup = document.getElementById('fireworksPopup');
        fireworksPopup.style.display = 'block';
        document.getElementById('congratsName').textContent = winnerName.toUpperCase(); // Update the winner's name in the congratulatory message
        startRaffleButton.disabled = false; // Disable the button immediately upon click

    }

    function stopRaffle() {
        clearInterval(raffleInterval);
    }

    let particleCount = 200;
    let particles = {};

    function Particle(color) {
        this.color = color;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.vx = Math.random() * 10 - 5;
        this.vy = Math.random() * 10 - 5;
        this.gravity = 0.3;
        this.opacity = Math.random();
    }

    Particle.prototype.update = function () {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.opacity -= 0.01;
    };

    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    };

    function createParticles(color) {
        particles[color] = [];
        for (let i = 0; i < particleCount; i++) {
            particles[color].push(new Particle(color));
        }
    }

    function updateParticles(color) {
        particles[color].forEach((particle, index) => {
            particle.update();
            if (particle.opacity <= 0) {
                particles[color].splice(index, 1);
            } else {
                particle.draw();
            }
        });
    }

    function drawParticles() {
        for (const color in particles) {
            updateParticles(color);
        }
    }

    let fireworksStartTime;

    function animate(color) {
        let startTime = Date.now(); // Capture the start time
        const animateFrame = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime; // Calculate the elapsed time
            if (elapsedTime < fireworksDuration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawParticles();
                requestAnimationFrame(animateFrame);
            } 
        };
        animateFrame(); // Start the animation loop
    }
    
    // Function to handle the "Okay" button click event
    function handleOkayButtonClick() {
        document.getElementById('fireworksPopup').style.display = 'none';
        if (names.length === 0) {
            alert("No names left for raffle!");
        } 
        if (audio) {
            audio.pause(); // Pause the audio when the "Okay" button is clicked
        }
    }

    // Function to handle the "Remove" button click event
    function handleRemoveButtonClick() {
        if (names.length === 0) {
            alert("No names left for raffle!");
        } else {
            const winnerName = document.getElementById('congratsName').textContent.trim().toLowerCase();
            console.log("Winner Name:", winnerName);
            const lowerCaseNames = names.map(name => name.toLowerCase()); // Convert names list to lowercase
            const index = lowerCaseNames.indexOf(winnerName); // Find index using lowercase names list
            console.log("Index:", index);
            if (index !== -1) {
                names.splice(index, 1);
                console.log("Names after removal:", names);
                // Remove the corresponding card element from the HTML
                const cardToRemove = document.querySelector('.card:nth-child(' + (index + 1) + ')');
                if (cardToRemove) {
                    cardToRemove.remove();
                }
            }
            document.getElementById('fireworksPopup').style.display = 'none';
            clearAllParticles();
        }
        if (audio) {
            audio.pause(); // Pause the audio when the "Okay" button is clicked
        }
    }



    // Event listener for the "Okay" button click
    const okayButton = document.getElementById('okButton');
    okayButton.addEventListener('click', handleOkayButtonClick);

    // Event listener for the "Remove" button click
    const removeButton = document.getElementById('removeButton');
    removeButton.addEventListener('click', handleRemoveButtonClick);

    document.addEventListener('DOMContentLoaded', function() {
        const nameInput = document.getElementById('nameInput');
        const addNameButton = document.getElementById('addNameButton');
        const startRaffleButton = document.getElementById('startRaffleButton');
        canvas = document.getElementById('fireworksCanvas');
        ctx = canvas.getContext('2d');

        addNameButton.addEventListener('click', addName);
        nameInput.addEventListener('keypress', addNameOnEnter);
        startRaffleButton.addEventListener('click', startRaffle);

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const okayButton = document.getElementById('okButton');
        okayButton.addEventListener('click', function() {
            document.getElementById('fireworksPopup').style.display = 'none';
            clearAllParticles();
        });

        document.getElementById('fireworksPopup').style.display = 'none';
    });

    function clearAllParticles() {
        particles = {};
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function startFireworksColor(color) {
        createParticles(color); // Call createParticles to initialize particles for the specified color
        animate(color);
    }

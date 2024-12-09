const API_URL = 'http://localhost:5000'; // Update this to your backend URL

// Mock Database (You can replace this with real backend integration later)
const users = [];

// Handle Sign-Up
async function handleSignUp(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Prepare the data to be sent
    const userData = {
        username: username,
        email: email,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Show success message
            window.location.href = "login.html"; // Redirect to login page
        } else {
            alert(result.error); // Show error message
            console.error('Error during registration:', result.error);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred during registration. Please try again.');
    }
}

// Handle Login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    const loginData = {
        emailOrUsername: email,
        password: password
    };

    try {
        const response = await fetch(`${API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Show success message
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            alert(result.error); // Show error message
            console.error('Error during login:', result.error);
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred during login. Please try again.');
    }
}

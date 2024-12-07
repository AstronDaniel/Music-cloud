// Mock Database (You can replace this with real backend integration later)
const users = [];

// Handle Sign-Up
function handleSignUp(event) {
    event.preventDefault();

    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        alert("User already exists. Please log in.");
        return;
    }

    // Save user to the mock database
    users.push({ username, email, password });
    alert("Sign-Up successful! You can now log in.");
    window.location.href = "login.html";
}

// Handle Login
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    // Check if the user exists and password matches
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        alert(`Welcome back, ${user.username}!`);
        // Redirect to the main page after login
        window.location.href = "index.html";
    } else {
        alert("Invalid username or password.");
    }
}

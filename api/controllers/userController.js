const User = require('../../models/user');

// User Registration
exports.registerUser = async (req, res) => {
    console.log("read");
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        console.log('Existing User:', existingUser);

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('New User Saved:', newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(400).json({ error: 'User registration failed' });
    }
};

// User Login
exports.loginUser = async (req, res) => {
    const { emailOrUsername, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        });
        console.log('User Found:', user);

        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid email/username or password' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error during user login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// removeDuplicates.js
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// MongoDB Atlas connection URI
const uri = process.env.MONGODB_URI; // Store your connection string in .env

// Connect to MongoDB
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB!");
    removeDuplicates();
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

const Song = require('./models/song'); // Adjust the path to your Song model

async function removeDuplicates() {
    try {
        const duplicates = await Song.aggregate([
            {
                $group: {
                    _id: { url: "$url" },
                    uniqueIds: { $addToSet: "$_id" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        for (const duplicate of duplicates) {
            const [firstId, ...duplicateIds] = duplicate.uniqueIds;
            await Song.deleteMany({ _id: { $in: duplicateIds } });
        }

        console.log('Duplicates removed successfully');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error removing duplicates:', error);
        mongoose.connection.close();
    }
}
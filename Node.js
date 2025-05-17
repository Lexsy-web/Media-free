// Import the Express.js framework
const express = require('express');

// Create an instance of the Express.js app
const app = express();

// In-memory database for simplicity
const posts = [];

// Middleware to parse JSON requests
app.use(express.json());

/**
 * Create a new post
 * @route POST /create-post
 * @param {object} req.body - The post data
 * @returns {string} Success message
 */
app.post('/create-post', (req, res) => {
    try {
        const post = req.body;
        if (!post) {
            res.status(400).send({ message: 'Post data is required' });
            return;
        }
        posts.push(post);
        res.send({ message: 'Post created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating post' });
    }
});

/**
 * Get all posts
 * @route GET /get-posts
 * @returns {array} Array of posts
 */
app.get('/get-posts', (req, res) => {
    try {
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error fetching posts' });
    }
});

// Define the port to listen on
const port = 3000;

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});



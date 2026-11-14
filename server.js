// Import the express framework to build our server and handle routes
var express = require("express");

// Import CORS so our frontend (GitHub Pages) can talk to our backend (Render)
var cork = require("cors"); // (or keep var cors = require("cors");)
var cors = require("cors");

// Import MongoDB to connect to our database
var { MongoClient, ObjectId } = require("mongodb");

// Import path helper for our static images folder
var path = require("path");

// Initialize our express app
var app = express();

// Allow cross-origin requests and make sure Express can read JSON data sent from the frontend
app.use(cors());
app.use(express.json()); 

// Simple logger middleware to print every incoming request URL in the console
app.use(function(request, response, next) {
    console.log("In comes a request to: " + request.url);
    next();
});

// Setup static file serving so anyone can view our lesson images in the browser
var publicPath = path.join(__dirname, "images");
app.use("/images", express.static(publicPath));

// Global variables for our database connection and MongoDB Atlas URL
var db;
var mongoURL = "mongodb+srv://ac2265_db_user:kBJqw6Lky5RrXjm3@cluster0.3j9vlmp.mongodb.net/?family=4";

// GET route to fetch all documents from any collection (like lessons or users)
app.get("/collection/:collectionName", async function(request, response) {
    try {
        var collectionName = request.params.collectionName;
        var results = await db.collection(collectionName).find({}).toArray();
        response.json(results);
    } catch (err) {
        console.log("Error fetching collection: " + err);
        response.status(500).json({ error: "Failed to fetch collection data", details: err.message });
    }
});

// POST route to save a new checkout order into the orders collection
app.post("/collection/orders", async function(request, response) {
    try {
        var newOrder = request.body;
        var result = await db.collection("orders").insertOne(newOrder);
        response.status(201).json({ message: "Order placed successfully!", orderId: result.insertedId });
    } catch (err) {
        console.log("Error inserting order: " + err);
        response.status(500).json({ error: "Failed to insert order", details: err.message });
    }
});

// PUT route to update lesson spaces (decrement spaces when purchased)
app.put("/collection/lessons/:id", async (req, res, next) => {
    try {
        const lessonId = req.params.id;
        const updateData = req.body; // e.g. { spaces: 4 }

        const result = await db.collection("lessons").updateOne(
            { _id: new ObjectId(lessonId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Lesson not found" });
        }

        res.json({ message: "Lesson updated successfully", result });
    } catch (error) {
        next(error); 
    }
});

// Fallback 404 middleware if someone visits a route that doesn't exist
app.use(function(request, response) {
    response.status(404).json({ error: "Page or resource not found!" });
});

// Connect to MongoDB Atlas first, then start the server on Render's port or local port 3000
async function startServer() {
    try {
        var client = new MongoClient(mongoURL);
        await client.connect();
        db = client.db("coursework");
        console.log("Connected to MongoDB Atlas successfully!");

        const port = process.env.PORT || 3000;
        app.listen(port, function() {
            console.log("App started on port " + port);
        });
    } catch (err) {
        console.log("Database connection error: " + err);
    }
}

// Kick off the server
startServer();
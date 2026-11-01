// Express.js Backend Server for CST3144 Coursework
// Handles MongoDB connection, static file middleware, and REST API endpoints
var express = require("express");
var cors = require("cors");
var { MongoClient } = require("mongodb");

var app = express();

// Enable Cross-Origin Resource Sharing (CORS) and parse incoming JSON request bodies
app.use(cors());
app.use(express.json()); 

// Custom logger middleware to log incoming HTTP request URLs to the terminal console
app.use(function(request, response, next) {
    console.log("In comes a request to: " + request.url);
    next();
});

// Serve static lesson images from the 'images' directory
var path = require("path");
var publicPath = path.join(__dirname, "images");
app.use("/images", express.static(publicPath));

// MongoDB Atlas connection string and variable
var db;
var mongoURL = "mongodb+srv://ac2265_db_user:kBJqW6Lky5RrXjm3@cluster0.3j9vlmp.mongodb.net/?family=4";

// Connect using modern async/await syntax
async function startServer() {
    try {
        var client = new MongoClient(mongoURL);
        await client.connect();
        db = client.db("coursework");
        console.log("Connected to MongoDB Atlas successfully!");

        // Start the server only after database is connected
        app.listen(3000, function() {
            console.log("App started on port 3000");
        });
    } catch (err) {
        console.log("Database connection error: " + err);
    }
}

startServer();

// Get data from any collection from Mongo to display in frontend
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

// Save a new order to MongoDB orders collection
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

app.put("/collection/lessons/:id", async (req, res, next) => {
    try {
        const { ObjectId } = require("mongodb");
        const lessonId = req.params.id;
        const updateData = req.body; // e.g., { spaces: 4 }

        // Update the lesson matching the MongoDB 
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

app.use(function(request, response) {
    response.status(404).json({ error: "Page or resource not found!" });
});
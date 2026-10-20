var express = require("express");
var cors = require("cors");
var app = express();


app.use(cors());

app.use(function(request, response, next) {
    console.log("In comes a request to: " + request.url);
    next();
});

var lessons = [
    { id: 1001, subject: "Maths", location: "Hendon", price: 100, spaces: 5, image: "images/math.jpg" },
    { id: 1002, subject: "English", location: "Colindale", price: 80, spaces: 5, image: "images/english.jpg" },
    { id: 1003, subject: "Computer Science", location: "Brent Cross", price: 90, spaces: 5, image: "images/Computer Science.jpg" }
];

app.get("/", function(request, response) {
    response.json(lessons);
});

app.listen(3000, function() {
    console.log("App started on port 3000");
});
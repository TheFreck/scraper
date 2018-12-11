var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3005;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/articles", { useNewUrlParser: true });

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");





// Routes

app.get("/", function(req, res) {
  console.log("back home");
  res.render("index");
})

// A GET route for scraping the echoJS website

app.get("/scrape", function(req, res) {
  res.redirect("/drop");
  // First, we grab the body of the html with axios
  axios.get("http://www.washingtonpost.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("div.headline").each(function(i, element) {
      // Save an empty result object
      var result = {};
      console.log("pre result: ", result);
      const $this = $(this);

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $this.children("a")
        .text();
      result.link = $this.children("a")
        .attr("href");
      result.summary = $this.siblings("div.blurb")
        .text();

      console.log("result: ", result);
      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log("postDB: ", dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    // res.render("index");
    console.log("all done");
    // res.json("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
  .populate("note")
  .then(function(dbArticle) {
    console.log("articles/id: ", dbArticle);
    res.render("peruse", { link: dbArticle });
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Update the note

app.post("/articles/:id", function(req, res) {
  console.log("req.body: ", req.body);
  let title = req.body.title;
  let body = req.body.body;
  
  db.Note.create({
    title: title,
    body: body
  }).then(function(dbNote) {
    console.log("dbNote: ", dbNote._id);
    db.Article.findOneAndUpdate({
      _id: req.params.id
    }, 
    {
      $set: { 
        note: dbNote._id
      }
    }, 
    { 
      new: true 
    }
    ).then(function(dbArticle){
      console.log("dbArticle: ", dbArticle);
      res.json(dbArticle);
    }).catch(err){
      console.log("err: ", err);
    }

  })
});


// Route to clear the database

app.get("/drop", function(req, res){
  db.Article.remove({}, function(err){
    if(err){
      console.log("drop error: ", err);
    }else{
      console.log("collection dropped");
    }
    res.redirect("/");
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

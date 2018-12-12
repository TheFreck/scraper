var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3005;

// Initialize Express
var app = express();

// Configure middleware

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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

// A GET route for scraping the washington post

app.get("/scrape", function(req, res) {
  res.redirect("/drop");
  axios.get("http://www.washingtonpost.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("div.headline").each(function(i, element) {
      var result = {};
      const $this = $(this);

      result.title = $this.children("a")
        .text();
      result.link = $this.children("a")
        .attr("href");
      result.summary = $this.siblings("div.blurb")
        .text();

      // Create a new Article
      db.Article.create(result)
        .then(function(dbArticle) {
        })
        .catch(function(err) {
          console.log(err);
        });
    });

    // Send a message to the client
    console.log("all done");
    res.redirect("/");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing the article to read and comment on
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
    }).catch(err);
  })
});


// Route to clear the database

app.get("/drop", function(req, res){
  notesArray = [];
  db.Article.remove({}, function(err){
    if(err){
      console.log("article drop error: ", err);
    }else{
      console.log("articles dropped");
    }
    res.redirect("/drop-notes");
  });
});

app.get("/drop-notes", function(req, res){
  db.Note.remove({}, function(err){
    if(err){
      console.log("note drop error: ", err)
    }else{
      console.log("notes dropped");
    }
    res.redirect("/");
  });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

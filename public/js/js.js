// Grab the articles as a json
$.getJSON("/articles", function(data) {
  console.log("getJSON gotten: ", data.length);
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    let id = data[i]._id;
    let title = data[i].title;
    let summary;
    if(data[i].summary) {
      summary = `${data[i].summary}<br/>`
    }else{
      summary = "";
    };
    let link = data[i].link;
    $("#articles").append(`<p data-id="${id}"> <br/> ${title} <br /> ${summary} ${link}</p>`);
  }
});
  
// To start the scrape
$("#scrape").on("click", function(){
  console.log("scrape");
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  .then(function(data){
    let c = 0;
    setInterval(()=> {
      if(c < 10) {
        location.reload();
        console.log("scraped: ", data);
        c ++;
      }else{
        return;
      }
    }, 1000);
  })
})

// To clear out the DB
$("#drop").on("click", function(){
  console.log("drop");
  $.ajax({
    method: "GET",
    url: "/drop"
  })
  .then(function(data){
    location.reload();
    console.log("dropped: ");
  })
})

$("#back").on("click", function(){
  console.log("back");
  location.href = "/";
})

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  // Now make an ajax call for the Article
  location.href = `/articles/${thisId}`;
  $.ajax({
    method: "GET",
    url: `/articles/${thisId}`
  })
  .then(function(data) {
    noteInputs(data)
  });
});

function noteInputs(data){
  console.log("data: ");
  $("#titleinput").val(data.title);
  $("#bodyinput").val(data.body);
}

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log("data: ", data);
      $("#bodyinput").val() = data;
    });

  // Also, remove the values entered in the input and textarea for note entry
  // $("#titleinput").val("");
  // $("#bodyinput").val("");
});

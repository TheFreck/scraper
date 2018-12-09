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
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: `/articles/${thisId}`
  })
  .then(function(data) {
    console.log("data", data);
    location.href = `/articles/${thisId}`;
    // if (data.note) {
    //   $("#dataNote").html = data.note;
    //   console.log("data: ", data.note);
    //   $("#titleinput").val(data.note.title);
    //   $("#bodyinput").val(data.note.body);
    // }
  });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = `_${$(this).attr("data-id")}`;
  let title = $("#titleinput").val();
  let body = $("#bodyinput").val();
  console.log("id: ", thisId);
  console.log("title: ", title)
  console.log("body: ", body)
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: `/articles/${thisId}`,
    data: {
      title: title,
      body: body
    }
  })
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // $("#titleinput").val("");
  // $("#bodyinput").val("");
});

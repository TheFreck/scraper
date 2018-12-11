$.getJSON("/articles", function(data) {
  console.log("getJSON gotten: ", data.length);
  for (var i = 0; i < data.length; i++) {
    let id = data[i]._id;
    let title = data[i].title;
    let summary;
    if(data[i].summary) {
      summary = `${data[i].summary}<br/>`
    }else{
      summary = "";
    };
    let link = data[i].link;
    $("#articles").append(`<div data-id="${id}"> <h2> ${title} </h2> <p> ${summary} </p> <p> ${link} </p> <br> </div>`);
  }
});
  
// Start scraping
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

// To clear out the article and note collections
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

// clicking on an article
$(document).on("click", "p", function() {
  var thisId = $(this).attr("data-id");
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

// Save the note
$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");

  // Send the note to the back
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
  .then(function(data) {
    console.log("data: ", data);
    $("#bodyinput").val() = data;
  });

});

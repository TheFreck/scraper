# SCRAPER
A node application that scrapes the Washington Post and stores the info in MongoDB

## What's going on
* The front page gives the ability to scrape the current version of the washington post for articles
* It can take a few seconds for the scraping to return the articles
  * Next update should include something to distract the user while the articles load
* Once the articles load they are clickable
* Clicking an article will take the user to a page where an <iFrame> tag allows the user to read the article on the original page while leaving a note on a sidebar which is on this page
* The articles are stored in a a MongoDB collection and the notes are stored in another collection
* The articles collection contains a foreign key to the notes collection
* Right now there is only one comment per article
  * The comment can be updated but the next update should include the ability to store comments and read them like a news feed

### Technologies used
* Node JS
* Express
* Mongoose
* Cheerio
* Handlebars

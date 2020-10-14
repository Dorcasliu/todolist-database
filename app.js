const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({extends:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

const items=["By Food","Cook Food","Eat Food"];
const workItems=[];


app.get("/", function(req, res) {
  let day = new Date();
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  day=day.toLocaleDateString("en-US", options);
  res.render("list",{listTitle:day, newListItems:items});

  // res.send(currentDay.toString()); // need to send string to the browser
});

app.post("/",function(req,res){
  console.log(req.body);
  let item=req.body.newItem;
  if (req.body.button==="Work"){
    workItems.push(item);
    res.redirect("/work");
  }
  else{
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work",function(req,res){
  let title="Work List";
  res.render("list", {listTitle:title, newListItems:workItems});
});

app.get("/about",function(req,res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

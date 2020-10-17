const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();
app.use(bodyParser.urlencoded({
  extends: true
}));
app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-doris:Test112@cluster0.me8pf.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema); //name of the collection:items

const item1 = new Item({
  name: "Welcome to the todoList!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = { //embeded structure
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully add into the db");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
  // res.send(currentDay.toString()); // need to send string to the browser
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.listName;

  const item=new Item({
    name:itemName
  });
  if (listName==="Today"){
    item.save(); //add into the collection
    res.redirect("/");
  }else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName); // then go to ""/:customListName" part
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;
  if (listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        // console.log("successfully delete");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if (!err){
        res.redirect("/"+listName);
      }
     })
  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) { //creat a new document
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

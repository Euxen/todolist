//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://euxen:TIkidw7mVFrsayCA@cluster0.jpv1x4d.mongodb.net/todoListDB" , {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema,)

const item1 = new Item({
  name: "Welcome to your new to-do List!",
});
const item2 = new Item({
  name: "Hit the + button to add a new item!",
});
const item3 = new Item({
  name: "<--- Press the checkbox to delete the completed task!",
});

//Only when we need default items will we use this
const defaultList = [item1, item2, item3]

//This schema helps us save whatever custom page the user creates for his specific lists
const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", async (req, res) =>
{
  // !!!->>> Course was using an old version of mongoose, thus the following code won't work with the new version of mongoose because callback was deprecated
  // 
  // Item.find({}, function(err, foundItems){
  //   if(itemList.length === 0){
  //       Item.insertMany(defaultItems, function(err){
  //         if(err){
  //           console.log(err);
  //         }
  //         else{
  //           console.log("Successfully saved items");
  //         }
  //       });

  //       res.redirect("/");

  //   }
  //   else{
  //     res.render("list", {listTitle: "Today", newListItems: foundItems})
  //   }
  
  // });
  
  //New way of doing it using Async/Await
  //
  const foundItems = await Item.find();
  
  if (foundItems.length === 0){
    await Item.insertMany(defaultList)
    res.redirect("/");
  }
  else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  
});

// This is for dynamically creating pages
app.get("/:customListName", async(req, res) => {

  const customListName = _.capitalize(req.params.customListName);

  const queryResult = await List.findOne({name: customListName});

  if (!queryResult){
    const list = new List({
      name: customListName,
      items: defaultList
    })
  
     list.save();

     res.redirect("/" + customListName);
  }
  else{
    res.render("list", {listTitle: customListName, newListItems: queryResult.items});
  }

  

})

app.post("/", async(req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    const dyanmicList = await List.findOne({name: listName});
    dyanmicList.items.push(item);
    dyanmicList.save();
    res.redirect("/" + listName);
  }
  
});

//Used an async/await so the app can reload after the delete is done
app.post("/delete", async (req, res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    await Item.findByIdAndRemove(checkedItemID);

    res.redirect("/");
  }
  else{
    await List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemID}}});
    res.redirect("/" + listName);
  }


  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

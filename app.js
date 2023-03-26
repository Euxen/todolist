//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
mongoose.connect("mongodb://0.0.0.0:27017/todoListDB" , {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema,)

const item1 = new Item({
  name: "Study",
});
const item2 = new Item({
  name: "Sleep",
});
const item3 = new Item({
  name: "Program",
});

const defaultItems = [item1, item2, item3];

const itemList = [];

async function getDefaultData(){

  itemList.push(item1);
  itemList.push(item2);
  itemList.push(item3);

  try 
  {
    await Item.insertMany(itemList)
    .then(function()
    {
      console.log("Succesfully inserted default values");
    })
  }
  catch(err) 
  {
    console.log(err)
  }}
  


async function getAll(){
  try
  {
    const querryResult = await Item.find();
      querryResult.forEach((item) => {
      itemList.push(item);
    })
    
  }
  catch(err){
    console.log(err)
  }
};


app.get("/", function(req, res) 
{
  if (itemList.length === 0 ){
    // get something to insert default values then redirect to home page 
    getDefaultData();
    res.redirect("/");
  }
  else{
    // get all existing from the database and render it
    getAll();
    res.render("list", {listTitle: "Today", newListItems: itemList});
  }
  
  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();
  
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

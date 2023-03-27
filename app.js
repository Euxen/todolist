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

//Will display what we need
const itemList = [];

//Only when we need default items will we use this
const defaultList = [item1, item2, item3]

// async function getDefaultData(){

//   try 
//   {
//   //   // console.log(itemList)
//   //   await Item.insertMany(defaultList)
//   //   .then(function()
//   //   {
//   //     console.log("Succesfully inserted default values");
//   //     Item.save();
//   //     getAll();
//   //   })
//   // }
//   // catch(err) 
//   // {
//   //   console.log(err)
//   // }}
//   }
//   catch(err){
//     console.log(err)
//   }}


// async function getAll(){
//   try
//   {
//     //We get what is saved in the database
//     const querryResult = await Item.find();

//     console.log(querryResult);
    
//     // //   querryResult.forEach((item) => {
//     // //     const itemExist = itemList.includes(item);

//     // //     if(!itemExist){
//     // //       itemList.push(item);
//     // //     }
//     // // })
    
//     // //find the difference between two arrays
//     // let difference = querryResult.filter(x => !itemList.includes(x));

//     // //whatever is different, you add it to the local array to display
//     // difference.forEach((newItem) => {
//     //   itemList.push(newItem);
//     // })


//   }
//   catch(err){
//     console.log(err)
//   }
// };


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

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  
  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");
  
});

//Used an async/await so the app can reload after the delete is done
app.post("/delete", async (req, res) => {
  const checkedItemID = req.body.checkbox;

  await Item.findByIdAndRemove(checkedItemID);

  res.redirect("/");
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

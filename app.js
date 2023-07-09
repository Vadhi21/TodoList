const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
app.set("view engine","ejs");//do not use app.use
app.use(bodyParser.urlencoded({extended:true}));//to access request body
app.use(express.static("public"));




//establishing connection
mongoose.set({strictQuery:false});
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB",{useNewUrlParser:true}
,(err)=>{
  if(err){console.log(err);}
  else{console.log("Connection success!");}
});

//creating schema
const itemSchema = new mongoose.Schema({
  name: String
});

//creating model for the document
const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({name:"Welcome to your Todolist"});
const item2 = new Item({name:"Hit the + button to add a new item."});
const item3 = new Item({name:"<-- Hit this to delete an item"});
const defaultItems = [item1,item2,item3];

//new schema for dynamically creating a list along with its itemSchema
//it will have two fields the name(param) and the list of items
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List",listSchema);


// to delete an item from the today list or a custom list
app.post("/delete",function(req,res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;
console.log(checkedItemId);
  if(listName === "Today"){
  //if the list is the default one just go to it and delete the item
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item deleted successfully!");
        res.redirect("/");
      }
    });
}else{
  //if its a custom list first find out the list and then within its items
  // find the one with the specified item id and remove
  //to delete an array element within a document we can use pull
  //the pull operator removes from an existing array all instances of a value(s) that match a specified condition
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+ listName);
    }
  })
}

});

app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
          if(foundItems.length===0){ //if the db is empty insert default items
              Item.insertMany(defaultItems,function(err){
                if(err){
                  console.log(err);
                }else{
                  console.log("Successfully inserted the three items");
                }
              }); //we push items and redirect to get to else part
              res.redirect("/");
          }else{ //datbase has items so we pass it
              res.render("list",{listTitle:"Today",itemsArr:foundItems});
          }
    });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
    console.log(req.params.customListName)

    List.findOne({name:customListName},function(err,foundList){
      if(!err){
        if(!foundList){
          //list doesnt exisst so create and insert default items
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/"+ customListName);
        }else{
          //show the existing list
          res.render("list",{listTitle:foundList.name,itemsArr:foundList.items});
        }
      }
    })



});



//to add an item to the toodolist depending on the list name
app.post("/",function(req,res){
  const itemName = req.body.listItem;
  const listName = req.body.list;
  const nitem = new Item({name:itemName});

if(listName === "Today"){ //the post request is from the default page
  nitem.save();
  res.redirect("/");
}else{ //post request is from a custom list
    List.findOne({name:listName},function(err,foundList){

        foundList.items.push(nitem); //push the record to that list
        foundList.save();
        res.redirect("/" + listName);

    });
}
});




app.get("/about",function(req,res){
  res.render("about");
});
app.listen(3000,function(){
  console.log("Server started listening on the port 3000!");
});

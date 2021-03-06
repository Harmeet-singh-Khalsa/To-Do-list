//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const _ = require("lodash");
const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-Harmeet:q1w2e3r4t5@harmeet-d5wjl.mongodb.net/todolistdb",{useNewUrlParser:true , useUnifiedTopology : true});
const itemsSchema = {
  name : {
    type:String,
    required:[true]
  }};
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name: "Welcome to your todo list"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "Hit this to delete an item"
});


const listSchema={
  name: String,
  items :[itemsSchema]};
   const List = mongoose.model("List",listSchema);

const defaultItems= [item1,item2,item3];



app.get("/", function(req, res) {

  Item.find({}, function(err,foundItems){
  if(foundItems.length === 0){

    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);

      }else{
        console.log("Successfully saved data in itemsDB");
      }
    });
    res.redirect("/");
  }else{
  res.render("list", { listTitle : "Today" , newListItems : foundItems});
  }
  });

});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName} , function(err , foundList){
    if(!err){
      if(!foundList){
        //create a new list

          const list=new List({
            name : customListName ,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        //show an existing list
        res.render("list", { listTitle:foundList.name ,newListItems : foundList.items       });
      }
    }
  });

});

app.post("/" , function(req,res){
 const itemName= req.body.newItem;
 const listName = req.body.list;

 const item = new Item({
   name : itemName
 });

if(listName === "Today"){
  item.save();
  res.redirect("/");

}else{
  List.findOne({name : listName},function(err , foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}




});

app.post("/delete",function(req,res){
  const checkbox = req.body.checkbox;
  const listName = req.body.listName;


if(listName === "Today"){
  Item.findByIdAndRemove(checkbox, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Successfully deleted");
    }
    res.redirect("/");
  });
}else{
  List.findOneAndUpdate({name : listName},{$pull : {items :{ checkbox} }}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  });
}
});



app.get("/about",function(req,res){
  res.render("about");
});let port = process.env.PORT;
if(port== null || port == ""){
  port = 3000;
}



app.listen(port, function() {
  console.log("Server has started Successfully.");
});



const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const app = express();
const _ = require("lodash")

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to my To-Do-List "
});
const item2 = new Item({
  name: "Hit the + Button to Add the new Item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err)
        } else {
          console.log("operation success!")
        }

      });
      res.redirect("/")
    } else {
      res.render("list", { listTitle: "Today", newItems: foundItems });

    }
  });

});
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newItems: foundList.items })
      }
    }

  })

});


app.post("/", function (req, res) {

  const newItemNames = req.body.itemToAdd;
  const listName = req.body.list;

  const itemN = new Item({
    name: newItemNames
  })

  if (listName === "Today") {
    itemN.save()
    res.redirect("/")
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(itemN);
      foundList.save();
      res.redirect("/" + listName);
    })
  }

});

app.post("/delete", function (req, res) {
  const checkedItemsId = req.body.checkbox;
  const listName = req.body.listName;


  if(listName ==="Today"){
    Item.findByIdAndRemove(checkedItemsId, function (err) {
      if (!err) {
        console.log("The item which was selected is removed succesfully ")
        res.redirect("/")
      }
    })
  }else{
    List.findOneAndUpdate({name:listName} ,{$pull: {items: {_id:checkedItemsId}}} , function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
  
})



app.listen("3000", function () {
  console.log("port started at server 3000");
});
//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-uvindu:YmMvJWPfLKeNxSLf@cluster0.cwkoi2s.mongodb.net/todolistDB');

}

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item(
  {
    name: "welcome to the do list"
  }
);

const item2 = new Item(
  {
    name: "hit the + to add items"
  }
);

const item3 = new Item(
  {
    name: "<== click here to remove item"
  }
);
const defultItems = [item1, item2, item3];




app.get("/", function (req, res) {

  const day = date.getDate();

  Item.find({})
    .then(result => {
      if (result.length === 0) {
        Item.insertMany(defultItems)
          .then(result => {
            mongoose.connection.close()
            console.log("successfully added");
          })
          .catch(err => {
            console.log(err);
          });
        res.redirect("/");
      } else {
        res.render("list", { listTitle: day, newListItems: result});
      }

    })
    .catch(err => {
      console.log(err);
    })

});



app.get("/about", function (req, res) {
  res.render("about");
});



const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/:givenName", function (req, res) {

  const newRouteName = _.startCase(req.params.givenName);

  List.findOne({name: newRouteName})
  .then(result => {
    if(result){

      res.render("list",{ listTitle: result.name, newListItems: result.items})
      newSite = newRouteName;

    } else {
      const list = new List({
        name: req.params.givenName,
        items: defultItems
      })
      list.save();
      res.redirect("/" + newRouteName);
    } 
  })
  .catch(err => {
    console.log(err);
  });

});


app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === date.getDate()){

    newItem.save();

    res.redirect("/");

  } else {
    List.findOne({name: listName})
      .then(result => {
        result.items.push(newItem);
        result.save();

        res.redirect("/" + listName);
      })
      .catch(err => {
        console.log(err);
      })
  }


});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === date.getDate()){
    Item.findByIdAndRemove(checkedItemId)
    .then(result => {
        console.log(result);
      })
    .catch(err => {
      console.log(err);
    })  ;
  
    res.redirect("/");
  }else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemId}}}
    )
      .then(result =>{
        console.log("successfully deleted");
      } )
      .catch(err =>{
        console.log(err);
      });


    res.redirect("/" + listName);
  };


})




app.listen(3000, function () {
  console.log("Server started on port 3000");
});

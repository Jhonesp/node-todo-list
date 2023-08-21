import Express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";
const app = Express();
const PORT = process.env.PORT || 3030;
const mongologin = process.env.mongologin;

app.use(Express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

async function main(){
  await mongoose.connect("mongodb+srv://"+mongologin+"@cluster0.s2jdkav.mongodb.net/todolistDB");
  console.log("Conectado a la BD");
}
main();

//Parte de mongodb
const taskSchema = new mongoose.Schema({
  task: String
})

const Item = mongoose.model("Item", taskSchema);

var Items = [];
//Mongodb

const item1 = new Item({
  task: "Bienvenido a tu lista!"
})

const item2 = new Item({
  task: "Escribe una tarea nueva y presiona enviar!"
})

const item3 = new Item({
  task: "<---- Tacha para eliminar tareas"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  listItems: [taskSchema]
});

const List = mongoose.model("List", listSchema);

function fecha(){
  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }
  var day = today.toLocaleDateString("es-ES", options);
  return day;
}

app.get("/", async (req, res) => {
  
  await Item.find().then(function(items){
    Items = items;
  })

  //solo si la coleccion en la bd esta vacia, inserta los items default
  if (Items.length == 0){
    Item.insertMany(defaultItems);
    await Item.find().then(function(items){
      Items = items;
    })
  }

  res.render("list.ejs", { 
    KindOfDay: fecha() ,
    listTitle: "Lista Normal",
    newListItems: Items
  });
});

app.post("/", async(req, res) =>{
    var itemName = req.body.newItem;
    const listName = req.body.list;

    let userItem = new Item ({
      task: itemName
    })
    
    if(listName === "Lista Normal"){
      await userItem.save();
      res.redirect("/");
    }else{
      List.findOne({name: listName}).then(async function(foundList){
        foundList.listItems.push(userItem);
        await foundList.save();
        res.redirect("/"+listName);
      }).catch((err) =>{
        console.log(err);
    })
    }

})

app.post("/delete", async (req, res) => {
  const listName = req.body.listName;
  const checkedItemId = req.body.checkbox;
  if(listName === "Lista Normal"){
    await Item.deleteOne({_id: checkedItemId});
    res.redirect("/");
  }else{

    await List.findOneAndUpdate(
      {name: listName},
      {$pull: {listItems: {_id: checkedItemId}}}
    ).then(function () {
      res.redirect("/" + listName);
      })
        .catch(function (err) {
          console.log(err);
        });
  }
 
})

app.get("/:customListName", async(req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    await List.findOne({name: customListName}).then(async(foundList)=>{
      if (!foundList) {
        //Si no existe una lista custom, se crea una
        const list = new List ({
          name: customListName,
          listItems: defaultItems
        });    
        await list.save();
        res.redirect("/"+customListName);
      }else{
        //Si existe, se muetra la lista existente
        res.render("list.ejs", {
          KindOfDay: fecha(),
          listTitle: foundList.name,
          newListItems: foundList.listItems
        })
      }
    }).catch((err) =>{
        console.log(err);
    })
    
  })


app.listen(PORT, () => {
  console.log("servidor funcionando en puerto 3000");
});

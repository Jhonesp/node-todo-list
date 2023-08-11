import Express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
const app = Express();
app.use(Express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

async function main(){
  await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
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


app.get("/", async (req, res) => {
  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }

  await Item.find().then(function(items){
    Items = items;
  })

  var day = today.toLocaleDateString("es-ES", options);

  res.render("list.ejs", { 
    KindOfDay: day ,
    newListItems: Items
  });
});

app.post("/", (req, res) =>{
    var item = req.body.newItem;
    let userItem = new Item ({
      task: item
    })
    userItem.save();
    res.redirect("/");
})



app.listen(3000, () => {
  console.log("servidor funcionando en puerto 3000");
});

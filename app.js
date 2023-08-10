import Express from "express";
import bodyParser from "body-parser";

const app = Express();
app.use(Express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var items = [];

app.get("/", (req, res) => {
  var today = new Date();

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long"
  }

  var day = today.toLocaleDateString("es-ES", options);

  res.render("list", { 
    KindOfDay: day ,
    newListItems: items
  });
});

app.post("/", (req, res) =>{
    var item = req.body.newItem;
    items.push(item);
    res.redirect("/");
})



app.listen(3000, () => {
  console.log("servidor funcionando en puerto 3000");
});

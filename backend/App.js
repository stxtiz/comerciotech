const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://myUserAdmin:Ventana#123@localhost:27017/comerciotech",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
  }
);

// CRUD Clientes
app.get("/api/clientes", async (_, res) => {
  res.json(await Cliente.find());
});
app.post("/api/clientes", async (req, res) => {
  res.json(await Cliente.create(req.body));
});
app.put("/api/clientes/:id", async (req, res) => {
  res.json(
    await Cliente.findOneAndUpdate({ _id: Number(req.params.id) }, req.body, {
      new: true,
    })
  );
});
app.delete("/api/clientes/:id", async (req, res) => {
  res.json(await Cliente.findOneAndDelete({ _id: Number(req.params.id) }));
});

// CRUD Productos
app.get("/api/productos", async (_, res) => {
  res.json(await Producto.find());
});
app.post("/api/productos", async (req, res) => {
  res.json(await Producto.create(req.body));
});
app.put("/api/productos/:id", async (req, res) => {
  res.json(
    await Producto.findOneAndUpdate({ _id: Number(req.params.id) }, req.body, {
      new: true,
    })
  );
});
app.delete("/api/productos/:id", async (req, res) => {
  res.json(await Producto.findOneAndDelete({ _id: Number(req.params.id) }));
});

// CRUD Pedidos
app.get("/api/pedidos", async (_, res) => {
  res.json(
    await Pedido.find().populate("cliente_id").populate("productos.producto_id")
  );
});
app.post("/api/pedidos", async (req, res) => {
  res.json(await Pedido.create(req.body));
});
app.put("/api/pedidos/:id", async (req, res) => {
  res.json(
    await Pedido.findOneAndUpdate({ _id: Number(req.params.id) }, req.body, {
      new: true,
    })
  );
});
app.delete("/api/pedidos/:id", async (req, res) => {
  res.json(await Pedido.findOneAndDelete({ _id: Number(req.params.id) }));
});

app.listen(3000, () => {
  console.log("API corriendo en http://localhost:3000");
});

const mongoose = require("mongoose");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

const clientes = require("./comerciotech.Clientes.json");
const productos = require("./comerciotech.Productos.json");
const pedidos = require("./comerciotech.Pedidos.json");

mongoose.connect("mongodb://localhost:27017/comerciotech", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seed() {
  await Cliente.deleteMany();
  await Producto.deleteMany();
  await Pedido.deleteMany();

  await Cliente.insertMany(clientes);
  await Producto.insertMany(productos);
  await Pedido.insertMany(pedidos);

  console.log("Datos insertados con IDs personalizados");
  process.exit();
}

seed();

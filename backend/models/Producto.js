const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema({
  _id: Number,
  nombre: String,
  descripción: String,
  categoría: String,
  precio: Number,
  stock: Number,
  imagen: String,
});

module.exports = mongoose.model("Producto", productoSchema);

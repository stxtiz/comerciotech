const mongoose = require("mongoose");

const clienteSchema = new mongoose.Schema({
  _id: Number,
  nombre: String,
  correo: String,
  dirección: String,
  teléfono: String,
  contraseña_cifrada: String,
});

module.exports = mongoose.model("Cliente", clienteSchema);

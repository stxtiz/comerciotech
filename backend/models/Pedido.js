const mongoose = require("mongoose");

const pedidoSchema = new mongoose.Schema({
  _id: Number,
  cliente_id: { type: Number, ref: "Cliente" },
  fecha: Date,
  total: Number,
  estado: String,
  productos: [
    {
      _id: false, // Desactivar ObjectId automático
      producto_id: { type: Number, ref: "Producto" },
      cantidad: Number,
      precio_unitario: Number,
    },
  ],
});

module.exports = mongoose.model("Pedido", pedidoSchema);

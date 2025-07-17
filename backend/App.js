const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(
  "mongodb://myUserAdmin:Ventana%23123@localhost:27017/comerciotech",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
  }
);

// Log de conexión
mongoose.connection.on("connected", () => {
  console.log("Conectado a MongoDB");
});
mongoose.connection.on("error", (err) => {
  console.error("Error conectando a MongoDB:", err);
});

// CRUD Clientes
app.get("/api/clientes", async (_, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes" });
  }
});

app.post("/api/clientes", async (req, res) => {
  try {
    // Generar ID automáticamente si no existe
    if (!req.body._id) {
      const lastCliente = await Cliente.findOne().sort({ _id: -1 });
      req.body._id = lastCliente ? lastCliente._id + 1 : 1;
    }

    // Cifrar la contraseña si se proporciona
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.contraseña_cifrada = await bcrypt.hash(req.body.password, salt);
      delete req.body.password; // Eliminar la contraseña sin cifrar
    }

    const cliente = await Cliente.create(req.body);
    res.json(cliente);
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ error: "Error al crear cliente" });
  }
});

app.put("/api/clientes/:id", async (req, res) => {
  try {
    // Cifrar la contraseña si se proporciona
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.contraseña_cifrada = await bcrypt.hash(req.body.password, salt);
      delete req.body.password; // Eliminar la contraseña sin cifrar
    }

    const cliente = await Cliente.findOneAndUpdate(
      { _id: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

app.delete("/api/clientes/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findOneAndDelete({
      _id: Number(req.params.id),
    });
    if (!cliente) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({ error: "Error al eliminar cliente" });
  }
});

// CRUD Productos
app.get("/api/productos", async (_, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

app.post("/api/productos", async (req, res) => {
  try {
    // Generar ID automáticamente si no existe
    if (!req.body._id) {
      const lastProducto = await Producto.findOne().sort({ _id: -1 });
      req.body._id = lastProducto ? lastProducto._id + 1 : 1;
    }
    const producto = await Producto.create(req.body);
    res.json(producto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/api/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findOneAndUpdate(
      { _id: Number(req.params.id) },
      req.body,
      { new: true }
    );
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findOneAndDelete({
      _id: Number(req.params.id),
    });
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// CRUD Pedidos
app.get("/api/pedidos", async (_, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate("cliente_id")
      .populate("productos.producto_id");
    res.json(pedidos);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

app.post("/api/pedidos", async (req, res) => {
  try {
    // Generar ID automáticamente si no existe
    if (!req.body._id) {
      const lastPedido = await Pedido.findOne().sort({ _id: -1 });
      req.body._id = lastPedido ? lastPedido._id + 1 : 1;
    }

    // Convertir cliente_id si viene como string desde el frontend
    if (req.body.cliente_id) {
      req.body.cliente_id = Number(req.body.cliente_id);
    }

    // Limpiar y validar productos
    if (req.body.productos && Array.isArray(req.body.productos)) {
      req.body.productos = req.body.productos.map((producto) => ({
        producto_id: Number(producto.producto_id),
        cantidad: Number(producto.cantidad),
        precio_unitario: Number(producto.precio_unitario),
      }));
    }

    const pedido = await Pedido.create(req.body);
    const pedidoPopulado = await Pedido.findById(pedido._id)
      .populate("cliente_id")
      .populate("productos.producto_id");

    res.json(pedidoPopulado);
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res
      .status(500)
      .json({ error: "Error al crear pedido", details: error.message });
  }
});

app.put("/api/pedidos/:id", async (req, res) => {
  try {
    // Convertir cliente_id si viene como string desde el frontend
    if (req.body.cliente_id) {
      req.body.cliente_id = Number(req.body.cliente_id);
    }

    // Limpiar y validar productos
    if (req.body.productos && Array.isArray(req.body.productos)) {
      req.body.productos = req.body.productos.map((producto) => ({
        producto_id: Number(producto.producto_id),
        cantidad: Number(producto.cantidad),
        precio_unitario: Number(producto.precio_unitario),
      }));
    }

    const pedido = await Pedido.findOneAndUpdate(
      { _id: Number(req.params.id) },
      req.body,
      { new: true }
    )
      .populate("cliente_id")
      .populate("productos.producto_id");

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json(pedido);
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar pedido", details: error.message });
  }
});

app.delete("/api/pedidos/:id", async (req, res) => {
  try {
    const pedido = await Pedido.findOneAndDelete({
      _id: Number(req.params.id),
    });
    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }
    res.json(pedido);
  } catch (error) {
    console.error("Error al eliminar pedido:", error);
    res.status(500).json({ error: "Error al eliminar pedido" });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log("API corriendo en http://0.0.0.0:3000");
});

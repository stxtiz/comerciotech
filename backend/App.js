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

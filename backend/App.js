const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Cliente = require("./models/Cliente");
const Producto = require("./models/Producto");
const Pedido = require("./models/Pedido");

const app = express();
app.use(cors());
app.use(express.json());

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único con ID del producto
    const productId = req.body.producto_id || Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `producto_${productId}_${Date.now()}${extension}`);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

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

app.post("/api/productos", upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, categoria, stock } = req.body;
    
    // Generar ID automáticamente si no existe
    let productoId;
    if (!req.body._id) {
      const lastProducto = await Producto.findOne().sort({ _id: -1 });
      productoId = lastProducto ? lastProducto._id + 1 : 1;
    } else {
      productoId = req.body._id;
    }

    const productoData = {
      _id: productoId,
      nombre,
      precio: parseFloat(precio),
      categoria,
      stock: parseInt(stock)
    };

    // Si se subió una imagen, renombrar con el ID del producto
    if (req.file) {
      const extension = path.extname(req.file.filename);
      const newFilename = `producto_${productoId}${extension}`;
      const oldPath = req.file.path;
      const newPath = path.join(uploadsDir, newFilename);
      
      fs.renameSync(oldPath, newPath);
      productoData.imagen = `/uploads/${newFilename}`;
    }

    const producto = await Producto.create(productoData);
    res.json(producto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    // Si hay error, eliminar archivo subido
    if (req.file) {
      fs.unlink(req.file.path, (err) => {});
    }
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/api/productos/:id", upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, categoria, stock } = req.body;
    
    const updateData = {
      nombre,
      precio: parseFloat(precio),
      categoria,
      stock: parseInt(stock)
    };

    // Si se subió una nueva imagen
    if (req.file) {
      // Obtener el producto actual para eliminar la imagen anterior
      const productoAnterior = await Producto.findOne({ _id: Number(req.params.id) });
      if (productoAnterior && productoAnterior.imagen) {
        const imagenAnterior = path.join(__dirname, productoAnterior.imagen);
        if (fs.existsSync(imagenAnterior)) {
          fs.unlinkSync(imagenAnterior);
        }
      }

      // Renombrar nueva imagen con el ID del producto
      const extension = path.extname(req.file.filename);
      const newFilename = `producto_${req.params.id}${extension}`;
      const oldPath = req.file.path;
      const newPath = path.join(uploadsDir, newFilename);
      
      fs.renameSync(oldPath, newPath);
      updateData.imagen = `/uploads/${newFilename}`;
    }

    const producto = await Producto.findOneAndUpdate(
      { _id: Number(req.params.id) },
      updateData,
      { new: true }
    );
    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(producto);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    // Si hay error, eliminar archivo subido
    if (req.file) {
      fs.unlink(req.file.path, (err) => {});
    }
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const producto = await Producto.findOne({ _id: Number(req.params.id) });
    
    // Eliminar imagen si existe
    if (producto && producto.imagen) {
      const imagenPath = path.join(__dirname, producto.imagen);
      if (fs.existsSync(imagenPath)) {
        fs.unlinkSync(imagenPath);
      }
    }
    
    const productoEliminado = await Producto.findOneAndDelete({
      _id: Number(req.params.id),
    });
    if (!productoEliminado) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(productoEliminado);
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

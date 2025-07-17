# ComercioTech

**ComercioTech** es una aplicación web de tipo CRUD orientada a la gestión integral de clientes, productos y pedidos en comercios pequeños y medianos. El proyecto está compuesto por un backend en Node.js/Express y un frontend moderno en HTML, CSS y JavaScript vanilla. Toda la persistencia de datos se realiza con MongoDB.

---

## Descripción General

ComercioTech ofrece un panel centralizado para administrar toda la información relevante de un comercio, permitiendo operar sobre los datos de clientes, productos y pedidos de manera sencilla e intuitiva, desde una interfaz web responsiva basada en Bootstrap.

---

## Características Principales

- **Gestión de Clientes:** Alta, baja y modificación de clientes, con nombre, correo, dirección, teléfono y contraseña cifrada (bcryptjs).
- **Gestión de Productos:** CRUD completo de productos, incluyendo imagen, nombre, descripción, categoría, precio y stock.
- **Gestión de Pedidos:** Registro y actualización de pedidos, asociando clientes y productos múltiples con fecha, total, estado y desglose por producto.
- **Carga y visualización de imágenes** para productos.
- **Interfaz web responsiva** basada en Bootstrap 5.
- **API RESTful** para integración y desacoplamiento frontend-backend.
- **Persistencia en MongoDB** con modelos claros y validación.
- **Cifrado de contraseñas** en frontend antes de enviar al backend.

---

## Tecnologías Utilizadas

### Backend

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [CORS](https://www.npmjs.com/package/cors)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (para contraseñas)
- [multer](https://www.npmjs.com/package/multer) (para imágenes)

### Frontend

- HTML5, CSS3
- Bootstrap 5, Bootstrap Icons
- JavaScript (vanilla)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (cifrado en frontend)
- SweetAlert2 (para alertas)
- Responsive Design

---

## Estructura del Proyecto

```
comerciotech/
├── backend/
│   ├── App.js              # Servidor Express principal, rutas y lógica de negocio
│   ├── Seed.js             # Script opcional para poblar DB con datos de ejemplo
│   └── models/             # Esquemas de Mongoose
│       ├── Cliente.js
│       ├── Producto.js
│       └── Pedido.js
├── frontend/
│   ├── index.html          # Interfaz web principal (dashboard)
│   ├── style.css           # Estilos personalizados
│   └── crud.js             # Lógica JS para consumir API y manejar UI
```

---

## Instalación y Ejecución

### Prerrequisitos

- Node.js y npm instalados.
- MongoDB corriendo localmente en el puerto 27017.

### Backend

1. Ve al directorio `backend`:

   ```bash
   cd backend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. (Opcional) Pre-carga la base de datos con datos de ejemplo:

   ```bash
   node Seed.js
   ```

4. Inicia el servidor:

   ```bash
   node App.js
   ```

   La API estará corriendo en `http://localhost:3000`.

### Frontend

1. Ve al directorio `frontend` y abre `index.html` en tu navegador web.
2. Asegúrate de que el backend esté corriendo para que el dashboard pueda interactuar con la API.

---

## Uso

- Accede a la interfaz web para gestionar clientes, productos y pedidos.
- Los formularios permiten agregar, editar y eliminar registros.
- El sistema cifra las contraseñas de los clientes antes de enviarlas al backend.
- Los pedidos pueden asociar múltiples productos y cantidades.
- La gestión de imágenes de productos está soportada desde la UI.

---

## Modelo de Datos

### Cliente

- `_id`: Number
- `nombre`: String
- `correo`: String
- `dirección`: String
- `teléfono`: String
- `contraseña_cifrada`: String

### Producto

- `_id`: Number
- `nombre`: String
- `descripción`: String
- `categoría`: String
- `precio`: Number
- `stock`: Number
- `imagen`: String

### Pedido

- `_id`: Number
- `cliente_id`: ref Cliente
- `fecha`: Date
- `total`: Number
- `estado`: String
- `productos`: Array de objetos `{ producto_id, cantidad, precio_unitario }`

---

## Endpoints Principales (API REST)

- **Clientes**

  - `GET /api/clientes` — Listar clientes
  - `POST /api/clientes` — Crear cliente
  - `PUT /api/clientes/:id` — Editar cliente
  - `DELETE /api/clientes/:id` — Eliminar cliente

- **Productos**

  - `GET /api/productos` — Listar productos
  - `POST /api/productos` — Crear producto (con imagen)
  - `PUT /api/productos/:id` — Editar producto (con imagen)
  - `DELETE /api/productos/:id` — Eliminar producto

- **Pedidos**
  - `GET /api/pedidos` — Listar pedidos
  - `POST /api/pedidos` — Crear pedido
  - `PUT /api/pedidos/:id` — Editar pedido
  - `DELETE /api/pedidos/:id` — Eliminar pedido

---

## Notas y Consideraciones

- El backend y frontend están desacoplados; la comunicación es vía API REST.
- La base de datos usa IDs numéricos personalizados en lugar de ObjectId de MongoDB.
- El sistema está pensado como ejemplo educativo y puede extenderse fácilmente.
- Las imágenes se almacenan en el servidor, accesibles en `/uploads/`.
- El código está documentado y estructurado para facilitar su aprendizaje y mantenimiento.

---

## Autor

Desarrollado por [stxtiz](https://github.com/stxtiz).

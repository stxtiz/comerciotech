# ComercioTech

**ComercioTech** es una aplicación web de tipo CRUD (Crear, Leer, Actualizar, Eliminar) que permite la gestión de clientes, productos y pedidos en un entorno de comercio electrónico. El proyecto está dividido en dos partes principales: un backend con Node.js y Express, y un frontend en HTML, CSS y JavaScript puro.

## Descripción General

ComercioTech ofrece un panel centralizado para administrar toda la información relevante de un pequeño o mediano comercio, permitiendo operar sobre los datos de clientes, productos y pedidos de manera sencilla e intuitiva.

## Características Principales

- **Gestión de Clientes:** Alta, baja y modificación de clientes, incluyendo datos como nombre, correo, dirección, teléfono y contraseña (cifrada con bcryptjs).
- **Gestión de Productos:** CRUD completo de productos, con campos como nombre, descripción, categoría, precio, stock e imagen.
- **Gestión de Pedidos:** Registro y actualización de pedidos, asociando clientes y productos, con fecha, total, estado y detalle de productos comprados.
- **Interfaz web simple y funcional:** Todo gestionado desde un dashboard único.
- **Persistencia de datos:** Uso de MongoDB para almacenar la información.
- **API RESTful:** El backend expone endpoints para la gestión de cada entidad.

## Tecnologías Utilizadas

### Backend

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [CORS](https://www.npmjs.com/package/cors)

### Frontend

- HTML5, CSS3
- JavaScript (vanilla)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (para cifrado de contraseñas en el frontend)

## Estructura del Proyecto

```
comerciotech/
├── backend/
│   ├── App.js
│   ├── Seed.js
│   └── models/
│       ├── Cliente.js
│       ├── Producto.js
│       └── Pedido.js
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── crud.js
```

## Instalación y Ejecución

### Prerrequisitos

- Node.js y npm instalados.
- MongoDB en local corriendo en el puerto 27017.

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

1. Ve al directorio `frontend` y abre `index.html` en tu navegador.
2. Asegúrate de que el backend esté corriendo para que el dashboard pueda interactuar con la API.

## Uso

- Accede a la interfaz web para gestionar clientes, productos y pedidos.
- Los formularios permiten agregar, editar y eliminar registros.
- El sistema cifra las contraseñas de los clientes antes de enviarlas al backend.
- Los pedidos pueden asociar múltiples productos y cantidades.

## Modelos de Datos

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
- `productos`: Array de objetos (producto_id, cantidad, precio_unitario)

## Notas y Consideraciones

- El backend y frontend están desacoplados; la comunicación es vía API REST.
- El sistema está pensado como ejemplo educativo y puede extenderse fácilmente.
- La base de datos usa IDs numéricos personalizados en lugar de ObjectId.

## Autor

Desarrollado por [stxtiz](https://github.com/stxtiz).

// URL base de la API
const API = "http://23.23.80.50:3000/api";

// Variables globales para almacenar datos
window._clientes = [];
window._productos = [];
window._pedidos = [];

// Variable para productos del pedido actual
let productosDelPedido = [];

// Cache para estado de imágenes
const imageCache = new Map();

/* ========================= UTILIDADES DE IMAGEN ========================= */
// Función para crear imagen SVG por defecto
function crearImagenPorDefecto() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Crect width='50' height='50' fill='%23f8f9fa'/%3E%3Ctext x='25' y='25' text-anchor='middle' dy='.35em' font-family='Arial' font-size='10' fill='%236c757d'%3EImg%3C/text%3E%3C/svg%3E";
}

// Función para verificar si una URL de imagen existe
async function verificarImagen(url) {
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  try {
    const response = await fetch(url, { method: "HEAD" });
    const existe = response.ok;
    imageCache.set(url, existe);
    return existe;
  } catch (error) {
    imageCache.set(url, false);
    return false;
  }
}

/* ========================= CLIENTES ========================= */
function renderClientes(clientes) {
  const tbody = document.getElementById("clientes-list");
  tbody.innerHTML = "";

  if (clientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">
          <i class="bi bi-person-x me-2"></i>No hay clientes registrados
        </td>
      </tr>
    `;
    return;
  }

  clientes.forEach((c) => {
    const tr = document.createElement("tr");
    tr.className = "fade-in";
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 14px;">
            ${c.nombre.charAt(0).toUpperCase()}
          </div>
          <strong>${c.nombre}</strong>
        </div>
      </td>
      <td>${c.correo}</td>
      <td>${c.dirección}</td>
      <td>${c.teléfono}</td>
      <td>
        <div class="btn-group" role="group">
          <button class="btn btn-warning btn-sm" onclick='editCliente(${JSON.stringify(
            c
          )})' title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteCliente('${
            c._id
          }')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadClientes() {
  try {
    const res = await fetch(`${API}/clientes`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const clientes = await res.json();
    window._clientes = clientes;
    renderClientes(clientes);
    renderClientesSelect(clientes);
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    alert("Error al cargar clientes. Revisa la consola para más detalles.");
  }
}

function renderClientesSelect(clientes) {
  const select = document.getElementById("pedido-cliente");
  const currentValue = select.value;
  select.innerHTML = '<option value="">Seleccionar cliente...</option>';
  clientes.forEach((c) => {
    const option = document.createElement("option");
    option.value = c._id;
    option.textContent = `${c.nombre} (${c.correo})`;
    select.appendChild(option);
  });
  if (currentValue) select.value = currentValue;
}

function editCliente(cliente) {
  document.getElementById("cliente-form-title").innerHTML =
    '<i class="bi bi-person-gear me-2"></i>Editar Cliente';
  document.getElementById("cliente-id").value = cliente._id;
  document.getElementById("cliente-nombre").value = cliente.nombre;
  document.getElementById("cliente-correo").value = cliente.correo;
  document.getElementById("cliente-direccion").value = cliente.dirección;
  document.getElementById("cliente-telefono").value = cliente.teléfono;
  document.getElementById("cliente-password").value = "";
  document.getElementById("cliente-password").placeholder =
    "Dejar vacío para no cambiar";
  document.getElementById("cliente-password").required = false;
}

async function deleteCliente(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
    try {
      await fetch(`${API}/clientes/${id}`, { method: "DELETE" });
      loadClientes();
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      alert("Error al eliminar cliente");
    }
  }
}

async function submitClienteForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form["cliente-id"].value;
  const data = {
    nombre: form["cliente-nombre"].value,
    correo: form["cliente-correo"].value,
    dirección: form["cliente-direccion"].value,
    teléfono: form["cliente-telefono"].value,
  };

  // Solo incluir password si se proporcionó
  if (form["cliente-password"].value) {
    data.password = form["cliente-password"].value;
  }

  try {
    let response;
    if (id) {
      response = await fetch(`${API}/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      // Para nuevos clientes, la password es obligatoria
      if (!form["cliente-password"].value) {
        alert("La contraseña es obligatoria para nuevos clientes");
        return;
      }
      response = await fetch(`${API}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    await loadClientes();
    resetForm(form);
    alert(
      id ? "Cliente actualizado correctamente" : "Cliente creado correctamente"
    );
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    alert(`Error al guardar cliente: ${error.message}`);
  }
}

/* ========================= PRODUCTOS ========================= */
// Función auxiliar para construir URLs de imágenes de forma segura
function construirURLImagen(rutaImagen) {
  if (!rutaImagen) {
    return crearImagenPorDefecto();
  }

  // Limpiar la ruta y construir URL completa
  const rutaLimpia = rutaImagen.startsWith("/") ? rutaImagen : "/" + rutaImagen;
  return `${API}${rutaLimpia}`;
}

// Función auxiliar para manejar errores de imagen
function manejarErrorImagen(elemento, nombreProducto) {
  // Solo mostrar error una vez por imagen
  if (!elemento.dataset.errorMostrado) {
    console.warn(`⚠️ Imagen no disponible para: ${nombreProducto}`);
    elemento.dataset.errorMostrado = "true";
  }

  // Establecer imagen por defecto
  elemento.src = crearImagenPorDefecto();
  elemento.onerror = null; // Prevenir loops infinitos
}

function renderProductos(productos) {
  console.log("🎨 Renderizando productos:", productos.length);
  const tbody = document.getElementById("productos-list");

  if (!tbody) {
    console.error("❌ No se encontró el elemento con ID 'productos-list'");
    return;
  }

  tbody.innerHTML = "";

  if (productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="bi bi-box-seam-fill me-2"></i>No hay productos registrados
        </td>
      </tr>
    `;
    return;
  }

  productos.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.className = "fade-in";

    // Determinar color del badge según stock
    let stockBadge = "";
    if (p.stock === 0) {
      stockBadge = `<span class="badge bg-danger">${p.stock}</span>`;
    } else if (p.stock <= 10) {
      stockBadge = `<span class="badge bg-warning text-dark">${p.stock}</span>`;
    } else {
      stockBadge = `<span class="badge bg-success">${p.stock}</span>`;
    }

    // Crear la imagen con manejo de errores mejorado
    const imagenSrc = construirURLImagen(p.imagen);
    const imagenId = `img-producto-${p._id}`;

    tr.innerHTML = `
      <td>
        <img id="${imagenId}" 
             src="${imagenSrc}" 
             alt="${p.nombre}" 
             class="producto-img"
             loading="lazy">
      </td>
      <td>
        <strong>${p.nombre}</strong><br>
        <small class="text-muted">${p.descripción}</small>
      </td>
      <td><span class="badge bg-info">${p.categoría}</span></td>
      <td><strong class="text-success">$${p.precio.toFixed(2)}</strong></td>
      <td>${stockBadge}</td>
      <td>
        <div class="btn-group" role="group">
          <button class="btn btn-warning btn-sm" onclick='editProducto(${JSON.stringify(
            p
          )})' title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteProducto('${
            p._id
          }')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);

    // Agregar el manejador de errores después de insertar en el DOM
    const imgElement = document.getElementById(imagenId);
    if (imgElement) {
      imgElement.onerror = function () {
        manejarErrorImagen(this, p.nombre);
      };
    }
  });

  console.log("✅ Productos renderizados correctamente en el DOM");
}

async function loadProductos() {
  try {
    console.log("🔄 Cargando productos desde:", `${API}/productos`);
    const res = await fetch(`${API}/productos`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const productos = await res.json();
    console.log("✅ Productos cargados:", productos.length, "productos");

    // Solo mostrar datos detallados en modo debug
    if (window.location.hash === "#debug") {
      console.log("📄 Datos de productos:", productos);
    }

    window._productos = productos;
    renderProductos(productos);
    renderProductosSelect();
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    alert("Error al cargar productos. Revisa la consola para más detalles.");
  }
}

function editProducto(producto) {
  document.getElementById("producto-form-title").innerHTML =
    '<i class="bi bi-box-seam-gear me-2"></i>Editar Producto';
  document.getElementById("producto-id").value = producto._id;
  document.getElementById("producto-nombre").value = producto.nombre;
  document.getElementById("producto-descripcion").value = producto.descripción;
  document.getElementById("producto-categoria").value = producto.categoría;
  document.getElementById("producto-precio").value = producto.precio;
  document.getElementById("producto-stock").value = producto.stock;

  // Limpiar el input de archivo (no se puede preseleccionar archivos por seguridad)
  document.getElementById("producto-imagen").value = "";

  // Mostrar imagen actual si existe
  const imagenPreview = document.getElementById("imagen-preview");
  const imagenActual = document.getElementById("imagen-actual");

  if (producto.imagen) {
    imagenActual.src = construirURLImagen(producto.imagen);
    imagenActual.onerror = function () {
      console.warn(
        `⚠️ No se pudo cargar la imagen del producto: ${producto.nombre}`
      );
      this.src = crearImagenPorDefecto();
      this.onerror = null;
    };
    imagenPreview.classList.remove("d-none");
  } else {
    imagenPreview.classList.add("d-none");
  }
}

async function deleteProducto(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    try {
      await fetch(`${API}/productos/${id}`, { method: "DELETE" });
      loadProductos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("Error al eliminar producto");
    }
  }
}

async function submitProductoForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form["producto-id"].value;

  // Usar FormData para enviar archivos
  const formData = new FormData();
  formData.append("nombre", form["producto-nombre"].value);
  formData.append("descripcion", form["producto-descripcion"].value);
  formData.append("categoria", form["producto-categoria"].value);
  formData.append("precio", Number(form["producto-precio"].value));
  formData.append("stock", Number(form["producto-stock"].value));

  // Agregar archivo de imagen si existe
  const imagenFile = form["producto-imagen"].files[0];
  if (imagenFile) {
    formData.append("imagen", imagenFile);
  }

  // Si es edición, agregar el ID
  if (id) {
    formData.append("producto_id", id);
  }

  try {
    let response;
    if (id) {
      response = await fetch(`${API}/productos/${id}`, {
        method: "PUT",
        body: formData, // No incluir Content-Type header para FormData
      });
    } else {
      response = await fetch(`${API}/productos`, {
        method: "POST",
        body: formData, // No incluir Content-Type header para FormData
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    await loadProductos();
    resetForm(form);
    // Limpiar preview de imagen
    document.getElementById("imagen-preview").classList.add("d-none");
    alert(
      id
        ? "Producto actualizado correctamente"
        : "Producto creado correctamente"
    );
  } catch (error) {
    console.error("Error al guardar producto:", error);
    alert(`Error al guardar producto: ${error.message}`);
  }
}

/* ========================= PEDIDOS ========================= */
function renderPedidos(pedidos) {
  const tbody = document.getElementById("pedidos-list");
  tbody.innerHTML = "";

  if (pedidos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-4">
          <i class="bi bi-cart-x me-2"></i>No hay pedidos registrados
        </td>
      </tr>
    `;
    return;
  }

  pedidos.forEach((p) => {
    const tr = document.createElement("tr");
    tr.className = "fade-in";

    const clienteNombre = p.cliente_id?.nombre || `ID: ${p.cliente_id}`;
    const fechaFormateada = p.fecha
      ? new Date(p.fecha).toLocaleDateString()
      : "N/A";

    // Badge de estado
    let estadoBadge = "";
    switch (p.estado) {
      case "Pendiente":
        estadoBadge =
          '<span class="badge bg-warning text-dark">Pendiente</span>';
        break;
      case "En Proceso":
        estadoBadge = '<span class="badge bg-info">En Proceso</span>';
        break;
      case "Enviado":
        estadoBadge = '<span class="badge bg-primary">Enviado</span>';
        break;
      case "Entregado":
        estadoBadge = '<span class="badge bg-success">Entregado</span>';
        break;
      case "Cancelado":
        estadoBadge = '<span class="badge bg-danger">Cancelado</span>';
        break;
      default:
        estadoBadge = '<span class="badge bg-secondary">Desconocido</span>';
    }

    // Crear información detallada de productos
    let productosInfo = "";
    if (p.productos && p.productos.length > 0) {
      const productosDetalle = p.productos
        .map((prod) => {
          const nombreProducto =
            prod.producto_id?.nombre || `ID: ${prod.producto_id}`;
          return `<div class="d-flex justify-content-between align-items-center mb-1">
          <small class="text-truncate me-2" style="max-width: 140px;" title="${nombreProducto}">
            <strong>${nombreProducto}</strong>
          </small>
          <span class="badge bg-primary rounded-pill">${prod.cantidad}</span>
        </div>`;
        })
        .join("");

      productosInfo = `
        <div class="productos-detalle" style="max-height: 120px; overflow-y: auto;">
          ${productosDetalle}
        </div>
      `;
    } else {
      productosInfo = `<span class="text-muted">No hay productos</span>`;
    }

    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center">
          <div class="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-size: 12px;">
            <i class="bi bi-person"></i>
          </div>
          <strong>${clienteNombre}</strong>
        </div>
      </td>
      <td>${fechaFormateada}</td>
      <td><strong class="text-success">$${p.total.toFixed(2)}</strong></td>
      <td>${estadoBadge}</td>
      <td>
        ${productosInfo}
      </td>
      <td>
        <div class="btn-group" role="group">
          <button class="btn btn-warning btn-sm" onclick='editPedido(${JSON.stringify(
            p
          )})' title="Editar">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deletePedido('${
            p._id
          }')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderProductosSelect() {
  const selects = document.querySelectorAll(".producto-select");
  selects.forEach((select) => {
    const selectedValue = select.value;
    select.innerHTML = '<option value="">Seleccionar producto...</option>';

    window._productos.forEach((producto) => {
      const option = document.createElement("option");
      option.value = producto._id;
      option.textContent = `${producto.nombre} - $${producto.precio.toFixed(
        2
      )} (Stock: ${producto.stock})`;
      option.dataset.precio = producto.precio;
      option.dataset.stock = producto.stock;
      select.appendChild(option);
    });

    if (selectedValue) select.value = selectedValue;
  });
}

function agregarProductoAlPedido() {
  const wrapper = document.getElementById("pedido-productos-wrapper");
  const index = productosDelPedido.length;

  const productoDiv = document.createElement("div");
  productoDiv.className = "producto-item";
  productoDiv.dataset.index = index;

  productoDiv.innerHTML = `
    <select class="form-select producto-select" data-index="${index}" required>
      <option value="">Seleccionar...</option>
    </select>
    <input type="number" class="form-control producto-cantidad" data-index="${index}" 
           min="1" value="1" placeholder="Cantidad" required style="max-width: 100px;">
    <input type="text" class="form-control producto-precio-unitario" data-index="${index}" 
           placeholder="Precio" readonly style="max-width: 120px;">
    <span class="producto-subtotal fw-bold text-primary" data-index="${index}">$0.00</span>
    <button type="button" class="btn btn-danger btn-sm" onclick="eliminarProductoDelPedido(${index})" title="Eliminar">
      <i class="bi bi-trash"></i>
    </button>
  `;

  wrapper.appendChild(productoDiv);

  // Agregar producto al array
  productosDelPedido.push({
    producto_id: "",
    cantidad: 1,
    precio_unitario: 0,
  });

  // Llenar select de productos
  renderProductosSelect();

  // Agregar event listeners
  const select = productoDiv.querySelector(".producto-select");
  const cantidadInput = productoDiv.querySelector(".producto-cantidad");

  select.addEventListener("change", (e) =>
    actualizarProductoPedido(index, "producto_id", e.target.value)
  );
  cantidadInput.addEventListener("input", (e) =>
    actualizarProductoPedido(index, "cantidad", e.target.value)
  );
}

function actualizarProductoPedido(index, campo, valor) {
  if (!productosDelPedido[index]) return;

  if (campo === "producto_id") {
    productosDelPedido[index].producto_id = valor;

    // Actualizar precio unitario
    const selectedOption = document.querySelector(
      `.producto-select[data-index="${index}"] option[value="${valor}"]`
    );
    if (selectedOption && selectedOption.dataset.precio) {
      const precio = Number(selectedOption.dataset.precio);
      productosDelPedido[index].precio_unitario = precio;

      const precioInput = document.querySelector(
        `.producto-precio-unitario[data-index="${index}"]`
      );
      precioInput.value = `$${precio.toFixed(2)}`;
    }
  } else if (campo === "cantidad") {
    productosDelPedido[index].cantidad = Number(valor);
  }

  actualizarSubtotal(index);
  calcularTotalPedido();
}

function actualizarSubtotal(index) {
  const producto = productosDelPedido[index];
  if (!producto) return;

  const subtotal = producto.cantidad * producto.precio_unitario;
  const subtotalSpan = document.querySelector(
    `.producto-subtotal[data-index="${index}"]`
  );
  if (subtotalSpan) {
    subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
  }
}

function eliminarProductoDelPedido(index) {
  const productoDiv = document.querySelector(
    `.producto-item[data-index="${index}"]`
  );
  if (productoDiv) productoDiv.remove();

  productosDelPedido.splice(index, 1);
  reindexarProductos();
  calcularTotalPedido();
}

function reindexarProductos() {
  const productosItems = document.querySelectorAll(".producto-item");
  productosItems.forEach((item, newIndex) => {
    item.dataset.index = newIndex;

    const select = item.querySelector(".producto-select");
    const cantidad = item.querySelector(".producto-cantidad");
    const precio = item.querySelector(".producto-precio-unitario");
    const subtotal = item.querySelector(".producto-subtotal");
    const btnEliminar = item.querySelector("button");

    if (select) {
      select.dataset.index = newIndex;
      select.removeEventListener("change", select._listener);
      select._listener = (e) =>
        actualizarProductoPedido(newIndex, "producto_id", e.target.value);
      select.addEventListener("change", select._listener);
    }

    if (cantidad) {
      cantidad.dataset.index = newIndex;
      cantidad.removeEventListener("input", cantidad._listener);
      cantidad._listener = (e) =>
        actualizarProductoPedido(newIndex, "cantidad", e.target.value);
      cantidad.addEventListener("input", cantidad._listener);
    }

    if (precio) precio.dataset.index = newIndex;
    if (subtotal) subtotal.dataset.index = newIndex;
    if (btnEliminar)
      btnEliminar.onclick = () => eliminarProductoDelPedido(newIndex);
  });
}

function calcularTotalPedido() {
  const total = productosDelPedido.reduce((sum, producto) => {
    return sum + producto.cantidad * producto.precio_unitario;
  }, 0);

  const totalSpan = document.getElementById("pedido-total");
  totalSpan.textContent = `$${total.toFixed(2)}`;
}

function limpiarProductosDelPedido() {
  productosDelPedido = [];
  const wrapper = document.getElementById("pedido-productos-wrapper");
  wrapper.innerHTML = "";
  const totalSpan = document.getElementById("pedido-total");
  totalSpan.textContent = "$0.00";
}

async function loadPedidos() {
  try {
    const res = await fetch(`${API}/pedidos`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const pedidos = await res.json();
    window._pedidos = pedidos;
    renderPedidos(pedidos);
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    alert("Error al cargar pedidos. Revisa la consola para más detalles.");
  }
}

function editPedido(pedido) {
  document.getElementById("pedido-form-title").innerHTML =
    '<i class="bi bi-cart-gear me-2"></i>Editar Pedido';
  document.getElementById("pedido-id").value = pedido._id;
  document.getElementById("pedido-cliente").value =
    pedido.cliente_id?._id || pedido.cliente_id;

  if (pedido.fecha) {
    const fecha = new Date(pedido.fecha);
    const fechaFormateada = fecha.toISOString().split("T")[0];
    document.getElementById("pedido-fecha").value = fechaFormateada;
  }

  document.getElementById("pedido-estado").value = pedido.estado;

  limpiarProductosDelPedido();

  if (pedido.productos && pedido.productos.length > 0) {
    pedido.productos.forEach((producto) => {
      agregarProductoAlPedido();
      const index = productosDelPedido.length - 1;

      setTimeout(() => {
        const select = document.querySelector(
          `.producto-select[data-index="${index}"]`
        );
        const cantidadInput = document.querySelector(
          `.producto-cantidad[data-index="${index}"]`
        );

        if (select && cantidadInput) {
          select.value = producto.producto_id?._id || producto.producto_id;
          cantidadInput.value = producto.cantidad;

          actualizarProductoPedido(index, "producto_id", select.value);
          actualizarProductoPedido(index, "cantidad", cantidadInput.value);
        }
      }, 100);
    });
  }
}

async function deletePedido(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este pedido?")) {
    try {
      await fetch(`${API}/pedidos/${id}`, { method: "DELETE" });
      loadPedidos();
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      alert("Error al eliminar pedido");
    }
  }
}

async function submitPedidoForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form["pedido-id"].value;
  const cliente = form["pedido-cliente"].value;
  const fecha = form["pedido-fecha"].value;
  const estado = form["pedido-estado"].value;

  if (!cliente) {
    alert("Por favor, selecciona un cliente para el pedido.");
    return;
  }

  if (productosDelPedido.length === 0) {
    alert("Por favor, agrega al menos un producto al pedido.");
    return;
  }

  for (let i = 0; i < productosDelPedido.length; i++) {
    const producto = productosDelPedido[i];
    if (!producto.producto_id || !producto.cantidad || producto.cantidad <= 0) {
      alert(`Por favor, completa los datos del producto ${i + 1}.`);
      return;
    }
  }

  const total = productosDelPedido.reduce((sum, producto) => {
    return sum + producto.cantidad * producto.precio_unitario;
  }, 0);

  const data = {
    cliente_id: cliente,
    fecha: fecha,
    total: total,
    estado: estado,
    productos: productosDelPedido.map((p) => ({
      producto_id: p.producto_id,
      cantidad: Number(p.cantidad),
      precio_unitario: Number(p.precio_unitario),
    })),
  };

  try {
    let response;
    if (id) {
      response = await fetch(`${API}/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      response = await fetch(`${API}/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    await loadPedidos();
    resetForm(form);
    limpiarProductosDelPedido();
    alert(
      id ? "Pedido actualizado correctamente" : "Pedido creado correctamente"
    );
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    alert(`Error al guardar pedido: ${error.message}`);
  }
}

/* ========== UTILITARIOS ========== */
function resetForm(form) {
  form.reset();

  const idFields = form.querySelectorAll('input[type="hidden"]');
  idFields.forEach((field) => (field.value = ""));

  if (form.id === "cliente-form") {
    document.getElementById("cliente-form-title").innerHTML =
      '<i class="bi bi-person-plus me-2"></i>Agregar Cliente';
    document.getElementById("cliente-password").placeholder = "Contraseña";
    document.getElementById("cliente-password").required = true;
  }
  if (form.id === "producto-form") {
    document.getElementById("producto-form-title").innerHTML =
      '<i class="bi bi-box-seam-fill me-2"></i>Agregar Producto';
    // Ocultar preview de imagen
    document.getElementById("imagen-preview").classList.add("d-none");
  }
  if (form.id === "pedido-form") {
    document.getElementById("pedido-form-title").innerHTML =
      '<i class="bi bi-cart-plus me-2"></i>Crear Pedido';
    limpiarProductosDelPedido();
  }
}

/* ========== EVENTOS ========== */
document.getElementById("cliente-form").onsubmit = submitClienteForm;
document.getElementById("cancelar-edicion-cliente").onclick = function () {
  resetForm(document.getElementById("cliente-form"));
};

document.getElementById("producto-form").onsubmit = submitProductoForm;
document.getElementById("cancelar-edicion-producto").onclick = function () {
  resetForm(document.getElementById("producto-form"));
};

document.getElementById("pedido-form").onsubmit = submitPedidoForm;
document.getElementById("cancelar-edicion-pedido").onclick = function () {
  resetForm(document.getElementById("pedido-form"));
};

document.getElementById("agregar-producto-al-pedido").onclick =
  agregarProductoAlPedido;

// Funciones globales para eventos onclick
window.editCliente = editCliente;
window.deleteCliente = deleteCliente;
window.editProducto = editProducto;
window.deleteProducto = deleteProducto;
window.editPedido = editPedido;
window.deletePedido = deletePedido;
window.eliminarProductoDelPedido = eliminarProductoDelPedido;

/* ========== INICIALIZACIÓN ========== */
window.onload = function () {
  console.log("✅ Aplicación cargada correctamente - Diseño Bootstrap");
  console.log("🔍 Verificando elementos del DOM...");

  // Verificar que existen los elementos necesarios
  const clientesList = document.getElementById("clientes-list");
  const productosList = document.getElementById("productos-list");
  const pedidosList = document.getElementById("pedidos-list");

  console.log("📋 Elementos encontrados:");
  console.log("- clientes-list:", clientesList ? "✅" : "❌");
  console.log("- productos-list:", productosList ? "✅" : "❌");
  console.log("- pedidos-list:", pedidosList ? "✅" : "❌");

  // Establecer fecha actual por defecto
  const pedidoFecha = document.getElementById("pedido-fecha");
  if (pedidoFecha) {
    pedidoFecha.value = new Date().toISOString().split("T")[0];
    console.log("📅 Fecha por defecto establecida");
  }

  // Cargar datos
  console.log("🚀 Iniciando carga de datos...");
  loadClientes();
  loadProductos()
    .then(() => {
      console.log("📦 Productos cargados, ahora cargando pedidos...");
      loadPedidos();

      // Mostrar información adicional en modo debug
      if (window.location.hash === "#debug") {
        console.log("🔍 Modo debug activado");
        console.log("📊 Cache de imágenes:", imageCache);
        console.log(
          "💡 Tip: Agregar #debug al final de la URL para ver información detallada"
        );
      }
    })
    .catch((error) => {
      console.error("❌ Error al cargar productos:", error);
      loadPedidos();
    });
};

// URL base de la API (ajusta si es necesario)
// Para AWS: cambiar por la IP pública o dominio de tu instancia
// Ejemplo: "http://18.XXX.XXX.XXX:3000/api" o "https://tu-dominio.com/api"
const API = "http://34.201.128.1:3000/api"; // ✅ IP de tu instancia AWS con PM2

window._clientes = [];
window._productos = [];
window._pedidos = [];

/* ========================= CLIENTES ========================= */
function renderClientes(clientes) {
  const ul = document.getElementById("clientes-list");
  ul.innerHTML = "";
  clientes.forEach((c) => {
    const li = document.createElement("li");
    li.t; /* ========== INICIALIZACIÓN ========== */
    window.onload = function () {
      console.log("✅ Aplicación cargada correctamente - Cifrado en backend");

      // Cargar datos en el orden correcto
      loadClientes();
      loadProductos()
        .then(() => {
          // Después de cargar productos, cargar pedidos
          loadPedidos();
        })
        .catch((error) => {
          console.error("Error al cargar productos:", error);
          // Cargar pedidos aunque falle la carga de productos
          loadPedidos();
        });
    };
    ent = `${c.nombre} (${c.correo}) - ${c.dirección}, ${c.teléfono}`;
    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.onclick = () => editCliente(c);
    const delBtn = document.createElement("button");
    delBtn.textContent = "Eliminar";
    delBtn.onclick = () => deleteCliente(c._id);
    li.append(" ", editBtn, delBtn);
    ul.appendChild(li);
  });
}

async function loadClientes() {
  try {
    const res = await fetch(`${API}/clientes`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
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
  select.innerHTML = "";
  clientes.forEach((c) => {
    const option = document.createElement("option");
    option.value = c._id;
    option.textContent = c.nombre;
    select.appendChild(option);
  });
}

function editCliente(cliente) {
  document.getElementById("cliente-id").value = cliente._id;
  document.getElementById("cliente-nombre").value = cliente.nombre;
  document.getElementById("cliente-correo").value = cliente.correo;
  document.getElementById("cliente-direccion").value = cliente.dirección;
  document.getElementById("cliente-telefono").value = cliente.teléfono;
  // No rellenar el campo de contraseña por seguridad
}

async function deleteCliente(id) {
  if (confirm("¿Eliminar cliente?")) {
    await fetch(`${API}/clientes/${id}`, { method: "DELETE" });
    loadClientes();
  }
}

async function submitClienteForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form["cliente-id"].value;
  const nombre = form["cliente-nombre"].value;
  const correo = form["cliente-correo"].value;
  const dirección = form["cliente-direccion"].value;
  const teléfono = form["cliente-telefono"].value;
  const password = form["cliente-password"].value;

  // Validar que se proporcione contraseña para nuevos clientes
  if (!id && !password) {
    alert("Por favor, ingresa una contraseña para el nuevo cliente.");
    return;
  }

  const data = {
    nombre,
    correo,
    dirección,
    teléfono,
  };

  // Solo enviar la contraseña si se proporciona
  if (password) {
    data.password = password; // El backend se encargará del cifrado
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
function renderProductos(productos) {
  const ul = document.getElementById("productos-list");
  ul.innerHTML = "";
  productos.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.nombre} - ${p.categoría} - $${p.precio} (${p.stock} en stock)`;
    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.onclick = () => editProducto(p);
    const delBtn = document.createElement("button");
    delBtn.textContent = "Eliminar";
    delBtn.onclick = () => deleteProducto(p._id);
    li.append(" ", editBtn, delBtn);
    ul.appendChild(li);
  });
}

async function loadProductos() {
  try {
    const res = await fetch(`${API}/productos`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const productos = await res.json();
    window._productos = productos;
    renderProductos(productos);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert("Error al cargar productos. Revisa la consola para más detalles.");
  }
}

function editProducto(producto) {
  document.getElementById("producto-id").value = producto._id;
  document.getElementById("producto-nombre").value = producto.nombre;
  document.getElementById("producto-descripcion").value = producto.descripción;
  document.getElementById("producto-categoria").value = producto.categoría;
  document.getElementById("producto-precio").value = producto.precio;
  document.getElementById("producto-stock").value = producto.stock;
  document.getElementById("producto-imagen").value = producto.imagen;
}

async function deleteProducto(id) {
  if (confirm("¿Eliminar producto?")) {
    await fetch(`${API}/productos/${id}`, { method: "DELETE" });
    loadProductos();
  }
}

async function submitProductoForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form["producto-id"].value;
  const nombre = form["producto-nombre"].value;
  const descripción = form["producto-descripcion"].value; // con tilde
  const categoría = form["producto-categoria"].value; // con tilde
  const precio = Number(form["producto-precio"].value);
  const stock = Number(form["producto-stock"].value);
  const imagen = form["producto-imagen"].value; // cambia a 'imagen'

  const data = {
    nombre,
    descripción,
    categoría,
    precio,
    stock,
    imagen,
  };

  try {
    let response;
    if (id) {
      response = await fetch(`${API}/productos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      response = await fetch(`${API}/productos`, {
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

    await loadProductos();
    resetForm(form);
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
// Variable para almacenar productos del pedido actual
let productosDelPedido = [];

function renderPedidos(pedidos) {
  const ul = document.getElementById("pedidos-list");
  ul.innerHTML = "";
  pedidos.forEach((p) => {
    const li = document.createElement("li");
    const clienteNombre = p.cliente_id?.nombre || `Cliente ID: ${p.cliente_id}`;
    const fechaFormateada = p.fecha
      ? new Date(p.fecha).toLocaleDateString()
      : "Sin fecha";

    li.innerHTML = `
      <strong>Cliente:</strong> ${clienteNombre} | 
      <strong>Fecha:</strong> ${fechaFormateada} | 
      <strong>Total:</strong> $${p.total} | 
      <strong>Estado:</strong> ${p.estado}
      <br>
      <strong>Productos:</strong> ${p.productos?.length || 0} items
    `;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.onclick = () => editPedido(p);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Eliminar";
    delBtn.onclick = () => deletePedido(p._id);

    li.append(" ", editBtn, delBtn);
    ul.appendChild(li);
  });
}

function renderProductosSelect() {
  const selects = document.querySelectorAll(".producto-select");
  selects.forEach((select) => {
    select.innerHTML = '<option value="">Seleccionar producto...</option>';
    window._productos.forEach((producto) => {
      const option = document.createElement("option");
      option.value = producto._id;
      option.textContent = `${producto.nombre} - $${producto.precio} (Stock: ${producto.stock})`;
      option.dataset.precio = producto.precio;
      option.dataset.stock = producto.stock;
      select.appendChild(option);
    });
  });
}

function agregarProductoAlPedido() {
  const wrapper = document.getElementById("pedido-productos-wrapper");
  const index = productosDelPedido.length;

  const productoDiv = document.createElement("div");
  productoDiv.className = "producto-item";
  productoDiv.dataset.index = index;

  productoDiv.innerHTML = `
    <div style="border: 1px solid #ccc; padding: 10px; margin: 5px 0; border-radius: 5px;">
      <label>Producto:</label>
      <select class="producto-select" data-index="${index}" required>
        <option value="">Seleccionar producto...</option>
      </select>
      
      <label>Cantidad:</label>
      <input type="number" class="producto-cantidad" data-index="${index}" min="1" value="1" required>
      
      <label>Precio Unitario:</label>
      <input type="number" class="producto-precio-unitario" data-index="${index}" step="0.01" readonly>
      
      <label>Subtotal:</label>
      <span class="producto-subtotal" data-index="${index}">$0.00</span>
      
      <button type="button" onclick="eliminarProductoDelPedido(${index})" style="margin-left: 10px; background: #dc3545; color: white;">
        Eliminar
      </button>
    </div>
  `;

  wrapper.appendChild(productoDiv);

  // Agregar el producto al array
  productosDelPedido.push({
    producto_id: "",
    cantidad: 1,
    precio_unitario: 0,
  });

  // Llenar el select con productos
  renderProductosSelect();

  // Agregar event listeners
  const select = productoDiv.querySelector(".producto-select");
  const cantidadInput = productoDiv.querySelector(".producto-cantidad");
  const precioInput = productoDiv.querySelector(".producto-precio-unitario");

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
    productosDelPedido[index].producto_id = Number(valor);

    // Actualizar precio unitario basado en el producto seleccionado
    const select = document.querySelector(
      `.producto-select[data-index="${index}"]`
    );
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption && selectedOption.dataset.precio) {
      const precio = Number(selectedOption.dataset.precio);
      productosDelPedido[index].precio_unitario = precio;

      const precioInput = document.querySelector(
        `.producto-precio-unitario[data-index="${index}"]`
      );
      precioInput.value = precio;
    }
  } else if (campo === "cantidad") {
    productosDelPedido[index].cantidad = Number(valor);
  }

  // Actualizar subtotal
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
  // Eliminar del DOM
  const productoDiv = document.querySelector(
    `.producto-item[data-index="${index}"]`
  );
  if (productoDiv) {
    productoDiv.remove();
  }

  // Eliminar del array
  productosDelPedido.splice(index, 1);

  // Reindexar los elementos restantes
  const productosItems = document.querySelectorAll(".producto-item");
  productosItems.forEach((item, newIndex) => {
    item.dataset.index = newIndex;

    // Actualizar todos los data-index y eventos
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

  calcularTotalPedido();
}

function calcularTotalPedido() {
  const total = productosDelPedido.reduce((sum, producto) => {
    return sum + producto.cantidad * producto.precio_unitario;
  }, 0);

  const totalInput = document.getElementById("pedido-total");
  totalInput.value = total.toFixed(2);
}

function limpiarProductosDelPedido() {
  productosDelPedido = [];
  const wrapper = document.getElementById("pedido-productos-wrapper");
  wrapper.innerHTML = "";
  const totalInput = document.getElementById("pedido-total");
  totalInput.value = "0.00";
}

async function loadPedidos() {
  try {
    const res = await fetch(`${API}/pedidos`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const pedidos = await res.json();
    window._pedidos = pedidos;
    renderPedidos(pedidos);
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    alert("Error al cargar pedidos. Revisa la consola para más detalles.");
  }
}

function editPedido(pedido) {
  document.getElementById("pedido-id").value = pedido._id;
  document.getElementById("pedido-cliente").value =
    pedido.cliente_id?._id || pedido.cliente_id;

  // Formatear fecha para el input date
  if (pedido.fecha) {
    const fecha = new Date(pedido.fecha);
    const fechaFormateada = fecha.toISOString().split("T")[0];
    document.getElementById("pedido-fecha").value = fechaFormateada;
  }

  document.getElementById("pedido-estado").value = pedido.estado;

  // Limpiar productos actuales
  limpiarProductosDelPedido();

  // Cargar productos del pedido
  if (pedido.productos && pedido.productos.length > 0) {
    pedido.productos.forEach((producto) => {
      agregarProductoAlPedido();
      const index = productosDelPedido.length - 1;

      // Establecer valores
      setTimeout(() => {
        const select = document.querySelector(
          `.producto-select[data-index="${index}"]`
        );
        const cantidadInput = document.querySelector(
          `.producto-cantidad[data-index="${index}"]`
        );

        if (select) {
          select.value = producto.producto_id?._id || producto.producto_id;
          actualizarProductoPedido(index, "producto_id", select.value);
        }

        if (cantidadInput) {
          cantidadInput.value = producto.cantidad;
          actualizarProductoPedido(index, "cantidad", producto.cantidad);
        }
      }, 100);
    });
  }
}

async function deletePedido(id) {
  if (confirm("¿Eliminar pedido?")) {
    await fetch(`${API}/pedidos/${id}`, { method: "DELETE" });
    loadPedidos();
  }
}

async function submitPedidoForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form["pedido-id"].value;
  const cliente = form["pedido-cliente"].value;
  const fecha = form["pedido-fecha"].value;
  const estado = form["pedido-estado"].value;

  // Validar que se haya seleccionado un cliente
  if (!cliente) {
    alert("Por favor, selecciona un cliente para el pedido.");
    return;
  }

  // Validar que haya al menos un producto
  if (productosDelPedido.length === 0) {
    alert("Por favor, agrega al menos un producto al pedido.");
    return;
  }

  // Validar que todos los productos tengan datos completos
  for (let i = 0; i < productosDelPedido.length; i++) {
    const producto = productosDelPedido[i];
    if (!producto.producto_id || !producto.cantidad || producto.cantidad <= 0) {
      alert(`Por favor, completa los datos del producto ${i + 1}.`);
      return;
    }
  }

  // Calcular el total
  const total = productosDelPedido.reduce((sum, producto) => {
    return sum + producto.cantidad * producto.precio_unitario;
  }, 0);

  const data = {
    cliente_id: Number(cliente),
    fecha: fecha,
    total: total,
    estado: estado,
    productos: productosDelPedido.map((p) => ({
      producto_id: Number(p.producto_id),
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
  if (form["cliente-id"]) form["cliente-id"].value = "";
  if (form["producto-id"]) form["producto-id"].value = "";
  if (form["pedido-id"]) form["pedido-id"].value = "";

  // Limpiar productos del pedido si es el formulario de pedidos
  if (form.id === "pedido-form") {
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

// Event listener para agregar productos al pedido
document.getElementById("agregar-producto-al-pedido").onclick =
  agregarProductoAlPedido;

// Función global para eliminar productos (necesaria para el onclick en el HTML)
window.eliminarProductoDelPedido = eliminarProductoDelPedido;

/* ========== INICIALIZACIÓN ========== */
window.onload = function () {
  console.log("✅ Aplicación cargada correctamente - Cifrado en backend");
  loadClientes();
  loadProductos();
  loadPedidos();
};

// URL base de la API (ajusta si es necesario)
const API = "http://localhost:3000/api";

window._clientes = [];
window._productos = [];
window._pedidos = [];

/* ========================= CLIENTES ========================= */
function renderClientes(clientes) {
  const ul = document.getElementById("clientes-list");
  ul.innerHTML = "";
  clientes.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `${c.nombre} (${c.correo}) - ${c.dirección}, ${c.teléfono}`;
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

  let contraseña_cifrada = "";

  // Si hay password, cifrar con bcryptjs (en el navegador)
  if (password) {
    const salt = bcrypt.genSaltSync(10);
    contraseña_cifrada = bcrypt.hashSync(password, salt);
  } else if (id) {
    // Si es edición y no se cambió la password, mantener la anterior
    const cliente = window._clientes.find((cli) => cli._id == id);
    if (cliente) contraseña_cifrada = cliente.contraseña_cifrada || "";
  }

  const data = {
    nombre,
    correo,
    dirección,
    teléfono,
    contraseña_cifrada,
  };

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
  const res = await fetch(`${API}/productos`);
  const productos = await res.json();
  window._productos = productos;
  renderProductos(productos);
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

  if (id) {
    await fetch(`${API}/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } else {
    await fetch(`${API}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
  loadProductos();
  resetForm(form);
}

/* ========================= PEDIDOS ========================= */
function renderPedidos(pedidos) {
  const ul = document.getElementById("pedidos-list");
  ul.innerHTML = "";
  pedidos.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `Cliente: ${p.cliente?.nombre || p.cliente} | Fecha: ${
      p.fecha
    } | Total: $${p.total} | Estado: ${p.estado}`;
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

async function loadPedidos() {
  const res = await fetch(`${API}/pedidos`);
  const pedidos = await res.json();
  window._pedidos = pedidos;
  renderPedidos(pedidos);
}

function editPedido(pedido) {
  document.getElementById("pedido-id").value = pedido._id;
  document.getElementById("pedido-cliente").value =
    pedido.cliente?._id || pedido.cliente;
  document.getElementById("pedido-fecha").value = pedido.fecha;
  document.getElementById("pedido-total").value = pedido.total;
  document.getElementById("pedido-estado").value = pedido.estado;
  // Aquí podrías rellenar los productos del pedido si tienes UI para ello
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
  const total = Number(form["pedido-total"].value);
  const estado = form["pedido-estado"].value;
  // Productos del pedido: se puede implementar
  const productos = []; // Implementa según tu UI

  const data = {
    cliente,
    fecha,
    total,
    estado,
    productos,
  };

  if (id) {
    await fetch(`${API}/pedidos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } else {
    await fetch(`${API}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }
  loadPedidos();
  resetForm(form);
}

/* ========== UTILITARIOS ========== */
function resetForm(form) {
  form.reset();
  if (form["cliente-id"]) form["cliente-id"].value = "";
  if (form["producto-id"]) form["producto-id"].value = "";
  if (form["pedido-id"]) form["pedido-id"].value = "";
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

/* ========== INICIALIZACIÓN ========== */
window.onload = function () {
  loadClientes();
  loadProductos();
  loadPedidos();
};

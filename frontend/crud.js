const API = "/api";

document.addEventListener("DOMContentLoaded", () => {
  // Clientes
  const clienteForm = document.getElementById("cliente-form");
  const cancelClienteBtn = document.getElementById("cancelar-edicion-cliente");
  clienteForm.addEventListener("submit", submitClienteForm);
  cancelClienteBtn.addEventListener("click", () => resetForm(clienteForm));
  loadClientes();

  // Productos
  const productoForm = document.getElementById("producto-form");
  const cancelProductoBtn = document.getElementById(
    "cancelar-edicion-producto"
  );
  productoForm.addEventListener("submit", submitProductoForm);
  cancelProductoBtn.addEventListener("click", () => resetForm(productoForm));
  loadProductos();

  // Pedidos
  const pedidoForm = document.getElementById("pedido-form");
  const cancelPedidoBtn = document.getElementById("cancelar-edicion-pedido");
  pedidoForm.addEventListener("submit", submitPedidoForm);
  cancelPedidoBtn.addEventListener("click", () => resetForm(pedidoForm));
  document
    .getElementById("agregar-producto-al-pedido")
    .addEventListener("click", addProductoToPedido);
  loadPedidos();
  cargarSelectClientes();
  cargarProductosEnPedido();
});

// ----- Clientes CRUD -----
function loadClientes() {
  fetch(`${API}/clientes`)
    .then((r) => r.json())
    .then((clientes) => {
      const ul = document.getElementById("clientes-list");
      ul.innerHTML = "";
      clientes.forEach((c) => {
        const li = document.createElement("li");
        li.textContent = `${c.nombre} (${c.correo}) - ${c.dirección} - ${c.teléfono}`;
        li.innerHTML += ` <button onclick="editCliente('${c._id}')">Editar</button> <button onclick="deleteCliente('${c._id}')">Eliminar</button>`;
        ul.appendChild(li);
      });
      window._clientes = clientes;
      cargarSelectClientes();
    });
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

  let contraseña_cifrada = window._last_client_password_hash || "";

  if (password) {
    const salt = bcrypt.genSaltSync(10);
    contraseña_cifrada = bcrypt.hashSync(password, salt);
  } else if (id) {
    const cliente = window._clientes.find((cli) => cli._id == id);
    if (cliente) contraseña_cifrada = cliente.contraseña_cifrada;
  }

  const data = {
    nombre,
    correo,
    dirección,
    teléfono,
    contraseña_cifrada,
  };

  if (id) {
    fetch(`${API}/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      loadClientes();
      resetForm(form);
    });
  } else {
    fetch(`${API}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      loadClientes();
      resetForm(form);
    });
  }
  window._last_client_password_hash = "";
}

function editCliente(id) {
  const c = window._clientes.find((cli) => cli._id == id);
  if (!c) return;
  document.getElementById("cliente-id").value = c._id;
  document.getElementById("cliente-nombre").value = c.nombre;
  document.getElementById("cliente-correo").value = c.correo;
  document.getElementById("cliente-direccion").value = c.dirección;
  document.getElementById("cliente-telefono").value = c.teléfono;
  document.getElementById("cliente-password").value = "";
  window._last_client_password_hash = c.contraseña_cifrada;
}

function deleteCliente(id) {
  if (confirm("¿Eliminar cliente?"))
    fetch(`${API}/clientes/${id}`, { method: "DELETE" }).then(loadClientes);
}

function cargarSelectClientes() {
  const select = document.getElementById("pedido-cliente");
  if (!select) return;
  const clientes = window._clientes || [];
  select.innerHTML = '<option value="">-- Selecciona Cliente --</option>';
  clientes.forEach((c) => {
    select.innerHTML += `<option value="${c._id}">${c.nombre}</option>`;
  });
}

// ----- Productos CRUD -----
function loadProductos() {
  fetch(`${API}/productos`)
    .then((r) => r.json())
    .then((productos) => {
      const ul = document.getElementById("productos-list");
      ul.innerHTML = "";
      productos.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = `${p.nombre} (${p.categoría}) - $${p.precio} - Stock:${p.stock}`;
        li.innerHTML += ` <button onclick="editProducto('${p._id}')">Editar</button> <button onclick="deleteProducto('${p._id}')">Eliminar</button>`;
        ul.appendChild(li);
      });
      window._productos = productos;
      cargarProductosEnPedido();
    });
}

function submitProductoForm(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nombre: form["producto-nombre"].value,
    descripción: form["producto-descripcion"].value,
    categoría: form["producto-categoria"].value,
    precio: Number(form["producto-precio"].value),
    stock: Number(form["producto-stock"].value),
    imagen: form["producto-imagen"].value,
  };
  const id = form["producto-id"].value;
  if (id) {
    fetch(`${API}/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      loadProductos();
      resetForm(form);
    });
  } else {
    fetch(`${API}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      loadProductos();
      resetForm(form);
    });
  }
}

function editProducto(id) {
  const p = window._productos.find((prod) => prod._id == id);
  if (!p) return;
  document.getElementById("producto-id").value = p._id;
  document.getElementById("producto-nombre").value = p.nombre;
  document.getElementById("producto-descripcion").value = p.descripción;
  document.getElementById("producto-categoria").value = p.categoría;
  document.getElementById("producto-precio").value = p.precio;
  document.getElementById("producto-stock").value = p.stock;
  document.getElementById("producto-imagen").value = p.imagen;
}

function deleteProducto(id) {
  if (confirm("¿Eliminar producto?"))
    fetch(`${API}/productos/${id}`, { method: "DELETE" }).then(loadProductos);
}

function cargarProductosEnPedido() {
  window._productos = window._productos || [];
  window._pedidos_productos = window._pedidos_productos || [];
  renderPedidoProductosInputs();
}

// ----- Pedidos CRUD -----
function loadPedidos() {
  fetch(`${API}/pedidos`)
    .then((r) => r.json())
    .then((pedidos) => {
      const ul = document.getElementById("pedidos-list");
      ul.innerHTML = "";
      pedidos.forEach((ped) => {
        const cliente = ped.cliente_id
          ? ped.cliente_id.nombre || ped.cliente_id
          : "";
        const fecha = ped.fecha ? new Date(ped.fecha).toLocaleDateString() : "";
        const productos = (ped.productos || [])
          .map((pp) => {
            const nombre = pp.producto_id
              ? pp.producto_id.nombre || pp.producto_id
              : "";
            return `${nombre} x${pp.cantidad} ($${pp.precio_unitario})`;
          })
          .join(", ");
        const li = document.createElement("li");
        li.textContent = `De: ${cliente} - Fecha: ${fecha} - Total: $${ped.total} - Estado: ${ped.estado} - Productos: ${productos}`;
        li.innerHTML += ` <button onclick="editPedido('${ped._id}')">Editar</button> <button onclick="deletePedido('${ped._id}')">Eliminar</button>`;
        ul.appendChild(li);
      });
      window._pedidos = pedidos;
    });
}

function submitPedidoForm(e) {
  e.preventDefault();
  const form = e.target;
  const id = form["pedido-id"].value;
  const productos = window._pedidos_productos || [];
  const data = {
    cliente_id: Number(form["pedido-cliente"].value),
    fecha: form["pedido-fecha"].value,
    total: Number(form["pedido-total"].value),
    estado: form["pedido-estado"].value,
    productos: productos,
  };
  if (id) {
    fetch(`${API}/pedidos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      loadPedidos();
      resetForm(form);
    });
  } else {
    fetch(`${API}/pedidos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      loadPedidos();
      resetForm(form);
    });
  }
  window._pedidos_productos = [];
  renderPedidoProductosInputs();
}

function editPedido(id) {
  const p = window._pedidos.find((ped) => ped._id == id);
  if (!p) return;
  document.getElementById("pedido-id").value = p._id;
  document.getElementById("pedido-cliente").value = p.cliente_id
    ? p.cliente_id._id
    : "";
  document.getElementById("pedido-fecha").value = p.fecha
    ? p.fecha.substr(0, 10)
    : "";
  document.getElementById("pedido-total").value = p.total;
  document.getElementById("pedido-estado").value = p.estado;
  window._pedidos_productos = (p.productos || []).map((pp) => ({
    producto_id: pp.producto_id?._id || pp.producto_id,
    cantidad: pp.cantidad,
    precio_unitario: pp.precio_unitario,
  }));
  renderPedidoProductosInputs();
}

function deletePedido(id) {
  if (confirm("¿Eliminar pedido?"))
    fetch(`${API}/pedidos/${id}`, { method: "DELETE" }).then(loadPedidos);
}

function addProductoToPedido() {
  window._productos = window._productos || [];
  window._pedidos_productos = window._pedidos_productos || [];
  const producto_id = window._productos[0]?._id || "";
  window._pedidos_productos.push({
    producto_id,
    cantidad: 1,
    precio_unitario: 0,
  });
  renderPedidoProductosInputs();
}

function renderPedidoProductosInputs() {
  const wrapper = document.getElementById("pedido-productos-wrapper");
  wrapper.innerHTML = "";
  (window._pedidos_productos || []).forEach((pp, idx) => {
    const select = document.createElement("select");
    select.name = `producto_id_${idx}`;
    window._productos.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p._id;
      opt.textContent = p.nombre;
      if (p._id == pp.producto_id) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", (e) => {
      window._pedidos_productos[idx].producto_id = Number(e.target.value);
    });

    const cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.min = "1";
    cantidad.value = pp.cantidad;
    cantidad.addEventListener("input", (e) => {
      window._pedidos_productos[idx].cantidad = Number(e.target.value);
    });

    const precio = document.createElement("input");
    precio.type = "number";
    precio.min = "0";
    precio.value = pp.precio_unitario;
    precio.placeholder = "Precio unitario";
    precio.addEventListener("input", (e) => {
      window._pedidos_productos[idx].precio_unitario = Number(e.target.value);
    });

    const btnQuitar = document.createElement("button");
    btnQuitar.type = "button";
    btnQuitar.textContent = "Quitar";
    btnQuitar.addEventListener("click", () => {
      window._pedidos_productos.splice(idx, 1);
      renderPedidoProductosInputs();
    });

    const div = document.createElement("div");
    div.appendChild(select);
    div.appendChild(cantidad);
    div.appendChild(precio);
    div.appendChild(btnQuitar);

    wrapper.appendChild(div);
  });
}

// ----- Utilidad -----
function resetForm(form) {
  form.reset();
  if (form["cliente-id"]) form["cliente-id"].value = "";
  if (form["producto-id"]) form["producto-id"].value = "";
  if (form["pedido-id"]) {
    form["pedido-id"].value = "";
    window._pedidos_productos = [];
    renderPedidoProductosInputs();
  }
  loadClientes();
  loadProductos();
  loadPedidos();
}

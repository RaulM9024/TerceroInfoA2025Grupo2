const contenidoPrincipal = document.getElementById('contenido-principal');
const menuPrincipalLinks = document.querySelectorAll('nav.menu-principal a');
const carritoCountHeader = document.getElementById('carrito-count-header');
const carritoVentana = document.getElementById('carrito-ventana');
const carritoList = document.getElementById('carrito-list');
const totalCarrito = document.getElementById('total-carrito');
const btnCerrarCarrito = document.getElementById('cerrar-carrito');
const modalLogin = document.getElementById('modal-login');
const btnCerrarLogin = document.getElementById('cerrar-login');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const formLogin = document.getElementById('form-login');

let usuarioLogueado = false;
let carrito = [];

// Lista de productos (ejemplo con categorías y promo)
const productos = [
  {
    id: 'p1',
    nombre: 'Zapatillas deportivas',
    descripcion: 'Ideales para correr o entrenar. Cómodas y resistentes.',
    categoria: 'deportes',
    imagen: 'https://via.placeholder.com/200x200?text=Zapatillas',
    precio: 59.99,
    promo: 39.99
  },
  {
    id: 'p2',
    nombre: 'Smartphone X100',
    descripcion: 'Alta velocidad, buena cámara y gran batería.',
    categoria: 'tecnologia',
    imagen: 'https://via.placeholder.com/200x200?text=Smartphone',
    precio: 249.99,
    promo: null
  },
  {
    id: 'p3',
    nombre: 'Batidora de cocina',
    descripcion: 'Perfecta para preparar batidos y salsas.',
    categoria: 'hogar',
    imagen: 'https://via.placeholder.com/200x200?text=Batidora',
    precio: 39.99,
    promo: 24.99
  },
  {
    id: 'p4',
    nombre: 'Chaqueta de invierno',
    descripcion: 'Te mantiene abrigado en climas fríos. Estilo moderno.',
    categoria: 'ropa',
    imagen: 'https://via.placeholder.com/200x200?text=Chaqueta',
    precio: 89.90,
    promo: null
  },
  {
    id: 'p5',
    nombre: 'Balón de fútbol',
    descripcion: 'Balón oficial para tus partidos y entrenamientos.',
    categoria: 'deportes',
    imagen: 'https://via.placeholder.com/200x200?text=Balon',
    precio: 29.99,
    promo: 19.99
  },
  {
    id: 'p6',
    nombre: 'Auriculares inalámbricos',
    descripcion: 'Disfruta de tu música sin cables.',
    categoria: 'tecnologia',
    imagen: 'https://via.placeholder.com/200x200?text=Auriculares',
    precio: 59.99,
    promo: 49.99
  }
];

// Función para renderizar productos con filtro y búsqueda
function renderProductos(categoria = 'todos', filtroTexto = '') {
  let filtrados = productos;

  if(categoria !== 'todos'){
    filtrados = filtrados.filter(p => p.categoria === categoria);
  }

  if(filtroTexto.trim() !== ''){
    const txt = filtroTexto.toLowerCase();
    filtrados = filtrados.filter(p =>
      p.nombre.toLowerCase().includes(txt) || p.descripcion.toLowerCase().includes(txt)
    );
  }

  let html = '';

  if(filtrados.length === 0){
    html = '<p>No se encontraron productos.</p>';
  } else {
    filtrados.forEach(p => {
      html += `
      <div class="producto">
        <img src="${p.imagen}" alt="${p.nombre}" />
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p class="precio">
          ${p.promo !== null ? `<span class="old-price">$${p.precio.toFixed(2)}</span> $${p.promo.toFixed(2)}` : `$${p.precio.toFixed(2)}`}
        </p>
        <button class="agregar-carrito" data-id="${p.id}">Agregar al carrito</button>
      </div>
      `;
    });
  }

  contenidoPrincipal.innerHTML = `
    <input type="text" id="buscador" placeholder="Buscar productos..." />
    <div class="filtro-categorias">
      <button class="activo" data-cat="todos">Todos</button>
      <button data-cat="deportes">Deportes</button>
      <button data-cat="ropa">Ropa</button>
      <button data-cat="hogar">Hogar</button>
      <button data-cat="tecnologia">Tecnología</button>
    </div>
    <div class="productos">${html}</div>
  `;

  // Añadir eventos filtro categorías
  const btnsFiltro = document.querySelectorAll('.filtro-categorias button');
  btnsFiltro.forEach(btn => {
    btn.onclick = () => {
      btnsFiltro.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      renderProductos(btn.dataset.cat, document.getElementById('buscador').value);
    }
  });

  // Añadir evento buscador
  const inputBuscar = document.getElementById('buscador');
  inputBuscar.oninput = () => {
    const catActivo = document.querySelector('.filtro-categorias button.activo').dataset.cat;
    renderProductos(catActivo, inputBuscar.value);
  };

  // Eventos botones agregar al carrito
  const btnsAgregar = document.querySelectorAll('.agregar-carrito');
  btnsAgregar.forEach(btn => {
    btn.onclick = () => {
      if (!usuarioLogueado) {
        mostrarLogin();
      } else {
        agregarAlCarrito(btn.dataset.id);
      }
    }
  });
}

// Funciones para mostrar secciones (Promoción, Novedades, About)
function mostrarPromocion() {
  contenidoPrincipal.innerHTML = `<h2>Promoción</h2><p>¡Aprovecha nuestras ofertas exclusivas!</p>`;
}
function mostrarNovedades() {
  contenidoPrincipal.innerHTML = `<h2>Novedades</h2><p>Descubre los productos recién llegados.</p>`;
}
function mostrarAbout() {
  contenidoPrincipal.innerHTML = `<h2>About</h2><p>Somos una tienda online dedicada a ofrecer lo mejor.</p>`;
}

// Mostrar ventana carrito
function mostrarCarrito() {
  if(carrito.length === 0){
    carritoList.innerHTML = '<p>Tu carrito está vacío.</p>';
    totalCarrito.textContent = 'Total: $0.00';
  } else {
    let html = '<ul>';
    let total = 0;
    carrito.forEach(item => {
      const prod = productos.find(p => p.id === item.id);
      const precioReal = prod.promo !== null ? prod.promo : prod.precio;
      total += precioReal * item.cantidad;
      html += `<li>
        ${prod.nombre} (x${item.cantidad}) - $${(precioReal * item.cantidad).toFixed(2)}
        <button class="eliminar-item" data-id="${item.id}">X</button>
      </li>`;
    });
    html += '</ul>';
    carritoList.innerHTML = html;
    totalCarrito.textContent = `Total: $${total.toFixed(2)}`;

    // Botones eliminar
    carritoList.querySelectorAll('button.eliminar-item').forEach(btn => {
      btn.onclick = () => {
        eliminarDelCarrito(btn.dataset.id);
      };
    });
  }
  carritoVentana.classList.add('visible');
}

// Agregar al carrito
function agregarAlCarrito(id){
  const index = carrito.findIndex(p => p.id === id);
  if(index >= 0){
    carrito[index].cantidad++;
  } else {
    carrito.push({id, cantidad: 1});
  }
  guardarCarrito();
  actualizarContador();
  alert('Producto agregado al carrito');
}

// Eliminar del carrito
function eliminarDelCarrito(id){
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito();
  actualizarContador();
  mostrarCarrito();
}

// Guardar carrito en localStorage
function guardarCarrito(){
  localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Cargar carrito de localStorage
function cargarCarrito(){
  const c = localStorage.getItem('carrito');
  carrito = c ? JSON.parse(c) : [];
  actualizarContador();
}

// Actualizar contador en header
function actualizarContador(){
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  carritoCountHeader.textContent = totalItems;
}

// Mostrar login modal
function mostrarLogin(){
  modalLogin.classList.remove('modal-oculto');
}

// Ocultar login modal
function ocultarLogin(){
  modalLogin.classList.add('modal-oculto');
}

// Eventos menú principal
menuPrincipalLinks.forEach(link => {
  link.onclick = (e) => {
    e.preventDefault();
    menuPrincipalLinks.forEach(l => l.classList.remove('activo'));
    link.classList.add('activo');
    const menu = link.dataset.menu;
    if(menu === 'inicio'){
      renderProductos();
    } else if(menu === 'promocion'){
      mostrarPromocion();
    } else if(menu === 'novedades'){
      mostrarNovedades();
    } else if(menu === 'about'){
      mostrarAbout();
    } else if(menu === 'carrito'){
      mostrarCarrito();
    }
  };
});

// Eventos cerrar carrito
btnCerrarCarrito.onclick = () => {
  carritoVentana.classList.remove('visible');
};

// Eventos login/register botones
btnLogin.onclick = (e) => {
  e.preventDefault();
  mostrarLogin();
};
btnRegister.onclick = (e) => {
  e.preventDefault();
  alert('Funcionalidad de registro pendiente.');
};

// Eventos modal login cerrar
btnCerrarLogin.onclick = () => {
  ocultarLogin();
};

// Evento formulario login (simulado)
formLogin.onsubmit = (e) => {
  e.preventDefault();
  // Para simplificar, aceptamos cualquier usuario y contraseña
  usuarioLogueado = true;
  ocultarLogin();
  alert('¡Inicio de sesión exitoso!');
};

// Cargar carrito y mostrar inicio al cargar la página
cargarCarrito();
renderProductos();

// Carrito de compras
const carrito = {
  productos: [],
  
  agregarProducto: function(producto) {
    const existe = this.productos.find(p => p.id === producto.id);
    if (existe) {
      existe.cantidad += 1;
    } else {
      this.productos.push({...producto, cantidad: 1});
    }
    this.guardar();
    this.actualizarUI();
    this.mostrarNotificacion(`${producto.nombre} añadido al carrito`);
  },
  
  eliminarProducto: function(id) {
    this.productos = this.productos.filter(p => p.id !== id);
    this.guardar();
    this.actualizarUI();
  },
  
  actualizarCantidad: function(id, cantidad) {
    const producto = this.productos.find(p => p.id === id);
    if (producto) {
      producto.cantidad = cantidad;
      if (producto.cantidad <= 0) {
        this.eliminarProducto(id);
      }
    }
    this.guardar();
    this.actualizarUI();
  },
  
  calcularTotal: function() {
    return this.productos.reduce((total, p) => total + (p.precio * p.cantidad), 0);
  },
  
  guardar: function() {
    localStorage.setItem('carrito', JSON.stringify(this.productos));
  },
  
  cargar: function() {
    const guardado = localStorage.getItem('carrito');
    if (guardado) {
      this.productos = JSON.parse(guardado);
    }
    this.actualizarUI();
  },
  
  actualizarUI: function() {
    // Actualizar icono del carrito
    const contador = document.querySelector('.carrito-contador');
    if (contador) {
      const totalItems = this.productos.reduce((total, p) => total + p.cantidad, 0);
      contador.textContent = totalItems;
      contador.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    // Actualizar vista del carrito
    if (document.getElementById('carrito-lista')) {
      this.mostrarCarrito();
    }
  },
  
  mostrarCarrito: function() {
    const lista = document.getElementById('carrito-lista');
    const total = document.getElementById('carrito-total');
    
    if (lista && total) {
      if (this.productos.length === 0) {
        lista.innerHTML = '<p class="text-center py-4">Tu carrito está vacío</p>';
        total.textContent = '$0';
        return;
      }
      
      lista.innerHTML = this.productos.map(producto => `
        <div class="carrito-item">
          <img src="${producto.imagen}" alt="${producto.nombre}" width="60">
          <div class="flex-grow-1">
            <h4>${producto.nombre}</h4>
            <p>$${(producto.precio * producto.cantidad).toLocaleString('es-CL')}</p>
            <div class="carrito-cantidad">
              <button class="btn-cantidad" data-id="${producto.id}" data-accion="restar">-</button>
              <span>${producto.cantidad}</span>
              <button class="btn-cantidad" data-id="${producto.id}" data-accion="sumar">+</button>
            </div>
          </div>
          <button class="btn-eliminar" data-id="${producto.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `).join('');
      
      total.textContent = `$${this.calcularTotal().toLocaleString('es-CL')}`;
    }
  },
  
  mostrarNotificacion: function(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.classList.add('mostrar');
    }, 10);
    
    setTimeout(() => {
      notificacion.classList.remove('mostrar');
      setTimeout(() => {
        document.body.removeChild(notificacion);
      }, 300);
    }, 3000);
  }
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  carrito.cargar();
  
  // Evento para botones "Añadir al carrito"
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-agregar')) {
      e.preventDefault();
      const btn = e.target.closest('.btn-agregar');
      const card = btn.closest('.product-card');
      
      const producto = {
        id: card.dataset.id,
        nombre: card.querySelector('.product-title').textContent.trim(),
        precio: parseFloat(
          card.querySelector('.product-price').textContent
            .replace('$', '')
            .replace(/\./g, '')
        ),
        imagen: card.querySelector('.product-img').src
      };
      
      carrito.agregarProducto(producto);
      
      // Feedback visual
      const icono = btn.querySelector('i');
      if (icono) {
        const original = icono.className;
        icono.className = 'fas fa-check';
        setTimeout(() => {
          icono.className = original;
        }, 2000);
      }
    }
    
    // Manejo de eventos del carrito
    if (e.target.closest('.btn-eliminar')) {
      e.preventDefault();
      const id = e.target.closest('.btn-eliminar').dataset.id;
      carrito.eliminarProducto(id);
    }
    
    if (e.target.closest('.btn-cantidad')) {
      e.preventDefault();
      const btn = e.target.closest('.btn-cantidad');
      const id = btn.dataset.id;
      const accion = btn.dataset.accion;
      const producto = carrito.productos.find(p => p.id === id);
      
      if (producto) {
        const nuevaCantidad = accion === 'sumar' ? producto.cantidad + 1 : producto.cantidad - 1;
        carrito.actualizarCantidad(id, nuevaCantidad);
      }
    }
  });
});
const socket = io();

// Función para actualizar productos en tiempo real
socket.on('actualizarProductos', (productos) => {
   const productosList = document.getElementById('productosList');
   productosList.innerHTML = ''; // Limpiar la lista existente
   productos.forEach(producto => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card');
      productCard.innerHTML = `
         <h2>${producto.title}</h2>
         <p>${producto.description}</p>
         <p>Precio: ${producto.price}</p>
         <p>Categoría: ${producto.category}</p>
         <p>Stock: ${producto.stock}</p>
         <p>Código: ${producto.code}</p>
         <p>Miniaturas: ${producto.thumbnails}</p>
         <button onclick="confirmarEliminacion('${producto.code}')">Eliminar</button>
      `;
      productosList.appendChild(productCard);
   });
});

// Manejar el envío del formulario para agregar nuevos productos
document.getElementById('productoForm').addEventListener('submit', (event) => {
   event.preventDefault();
   const formData = new FormData(event.target);
   const producto = {
      id: Date.now(), // Generar un ID único temporalmente
      title: formData.get('title'),
      description: formData.get('description'),
      price: formData.get('price'),
      category: formData.get('category'),
      stock: formData.get('stock'),
      code: formData.get('code'),
      thumbnails: formData.get('thumbnails') || 'null' // Valor predeterminado si no se proporciona
   };
   socket.emit('nuevoProducto', producto);
   event.target.reset(); // Limpiar el formulario
});

// Función para confirmar eliminación de productos
window.confirmarEliminacion = (productoCode) => {
   if (confirm("¿Desea eliminar este producto?")) {
       socket.emit('eliminarProducto', productoCode);
   }
};

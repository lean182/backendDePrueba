import express from 'express';
import fs from 'fs';
import path from 'path';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta Home
app.get('/', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer el archivo de productos');
      return;
    }

    const productos = JSON.parse(data);
    res.render('home', { productos });
  });
});

// Ruta Real time
app.get('/realtimeproducts', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error al leer el archivo de productos');
      return;
    }

    const productos = JSON.parse(data);
    res.render('realTimeProducts', { title: 'Cargar Productos' });
  });
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Configurar Socket.io
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Leer el archivo productos.json y emitir la lista de productos al nuevo cliente
  fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf-8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    const productos = JSON.parse(data);
    socket.emit('actualizarProductos', productos);
  });

  // Manejar nuevos productos
  socket.on('nuevoProducto', (producto) => {
    // Leer el archivo productos.json, agregar el nuevo producto y emitir la lista actualizada
    fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let productos = JSON.parse(data);
      productos.push(producto);

      fs.writeFile(path.join(__dirname, 'data', 'productos.json'), JSON.stringify(productos, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }

        io.emit('actualizarProductos', productos);
      });
    });
  });

  // Manejar eliminación de productos
  socket.on('eliminarProducto', (productoCode) => {
    fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let productos = JSON.parse(data);
      productos = productos.filter(p => p.code !== productoCode);

      fs.writeFile(path.join(__dirname, 'data', 'productos.json'), JSON.stringify(productos, null, 2), (err) => {
        if (err) {
          console.error(err);
          return;
        }

        io.emit('actualizarProductos', productos);
      });
    });
  });

});

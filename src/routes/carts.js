import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const cartsFilePath = path.join(__dirname, '../data/carritos.json');
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Leer carritos del archivo JSON
const readCarts = () => {
  const data = fs.readFileSync(cartsFilePath, 'utf8');
  return JSON.parse(data);
};

// Escribir carritos al archivo JSON
const writeCarts = (carts) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

// Leer productos del archivo JSON
const readProducts = () => {
  const data = fs.readFileSync(productsFilePath, 'utf8');
  return JSON.parse(data);
};

// Crear nuevo carrito
router.post('/', (req, res) => {
  const carts = readCarts();
  const newCart = {
    id: carts.length ? carts[carts.length - 1].id + 1 : 1,
    products: []
  };
  carts.push(newCart);
  writeCarts(carts);
  res.status(201).json(newCart);
});

// Obtener todos los carritos
router.get('/', (req, res) => {
  const carts = readCarts();
  res.json(carts);
});

// Obtener productos de un carrito por ID
router.get('/:cid', (req, res) => {
  const carts = readCarts();
  const { cid } = req.params;
  const cart = carts.find(c => c.id === parseInt(cid));
  if (!cart) {
    return res.status(404).json({ message: `Carrito con ID:${cid} no encontrado` });
  }
  res.json(cart.products);
});

// Obtener un producto específico de un carrito por ID
router.get('/:cid/product/:pid', (req, res) => {
  const carts = readCarts();
  const { cid, pid } = req.params;

  const cart = carts.find(c => c.id === parseInt(cid));
  if (!cart) {
    return res.status(404).json({ message: `Carrito con ID:${cid} no encontrado` });
  }

  const product = cart.products.find(p => p.product === parseInt(pid));
  if (!product) {
    return res.status(404).json({ message: `Producto con ID:${pid} no encontrado en el carrito` });
  }

  res.json(product);
});

// Agregar producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
  const carts = readCarts();
  const products = readProducts();
  const { cid, pid } = req.params;

  const cartIndex = carts.findIndex(c => c.id === parseInt(cid));
  if (cartIndex === -1) {
    return res.status(404).json({ message: `Carrito con ID:${cid} no encontrado` });
  }

  const product = products.find(p => p.id === parseInt(pid));
  if (!product) {
    return res.status(404).json({ message: `Producto con ID:${pid} no encontrado` });
  }

  const productInCartIndex = carts[cartIndex].products.findIndex(p => p.product === parseInt(pid));
  if (productInCartIndex !== -1) {
    const newQuantity = carts[cartIndex].products[productInCartIndex].quantity + 1;
    if (newQuantity > product.stock) {
      return res.status(400).json({ message: 'No se pueden agregar más productos de los disponibles en stock' });
    }
    carts[cartIndex].products[productInCartIndex].quantity = newQuantity;
  } else {
    if (1 > product.stock) {
      return res.status(400).json({ message: 'No se pueden agregar más productos de los disponibles en stock' });
    }
    carts[cartIndex].products.push({ product: parseInt(pid), title: product.title, code: product.code, quantity: 1 });
  }

  writeCarts(carts);
  res.status(201).json(carts[cartIndex]);
});

// Eliminar un carrito por ID
router.delete('/:cid', (req, res) => {
  const carts = readCarts();
  const { cid } = req.params;

  const cartIndex = carts.findIndex(c => c.id === parseInt(cid));
  if (cartIndex === -1) {
    return res.status(404).json({ message: `Carrito con ID:${cid} no encontrado` });
  }

  carts.splice(cartIndex, 1);
  writeCarts(carts);
  res.status(200).json({ message: `Carrito con ID:${cid} eliminado` });
});

// Eliminar producto de un carrito por ID
router.delete('/:cid/product/:pid', (req, res) => {
  const carts = readCarts();
  const { cid, pid } = req.params;

  const cartIndex = carts.findIndex(c => c.id === parseInt(cid));
  if (cartIndex === -1) {
    return res.status(404).json({ message: `Carrito con ID:${cid} no encontrado` });
  }

  const productIndex = carts[cartIndex].products.findIndex(p => p.product === parseInt(pid));
  if (productIndex === -1) {
    return res.status(404).json({ message: `Producto con ID:${pid} no encontrado en el carrito` });
  }

  carts[cartIndex].products.splice(productIndex, 1);
  writeCarts(carts);
  res.status(200).json({ message: `Producto con ID:${pid} eliminado del carrito con ID:${cid}` });
});

export default router;






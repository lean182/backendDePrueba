import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Leer productos del archivo JSON
const readProducts = () => {
  const data = fs.readFileSync(productsFilePath, 'utf8');
  return JSON.parse(data);
};

// Pasar productos al archivo JSON
const writeProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Mostrar todos los productos
router.get('/', (req, res) => {
  const products = readProducts();
  const { limit } = req.query;
  if (limit) {
    return res.json(products.slice(0, limit));
  }
  res.json(products);
});

// Obtener producto por ID
router.get('/:pid', (req, res) => {
  const products = readProducts();
  const { pid } = req.params;
  const product = products.find(p => p.id === parseInt(pid));
  if (!product) {
    return res.status(404).json({ message: `Producto con ID:${pid} no encontrado` });
  }
  res.json(product);
});

// Agregar nuevo producto
router.post('/', (req, res) => {
  const products = readProducts();
  const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ message: 'Todos los campos excepto las thumbnails son obligatorios.' });
  }
   // Verifica si el producto con el mismo código ya existe
   const existingProduct = products.find(p => p.code === code);
   if (existingProduct) {
     return res.status(400).json({ message: `Producto con el código:${code} ya existe` });
   }
  const newProduct = {
    id: products.length ? products[products.length - 1].id + 1 : 1,
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  };
  products.push(newProduct);
  writeProducts(products);
  res.status(201).json({ message: `Producto agregado correctamente`, product: newProduct });
});

// Actualizar producto por ID
router.put('/:pid', (req, res) => {
  const products = readProducts();
  const { pid } = req.params;
  const productIndex = products.findIndex(p => p.id === parseInt(pid));
  if (productIndex === -1) {
    return res.status(404).json({ message: `Producto con ID:${pid} no encontrado` });
  }

  const { code } = req.body;
  if (code && products.some((p, index) => p.code === code && index !== productIndex)) {
    return res.status(400).json({ message: `Producto con el código:${code} ya existe` });
  }

  const updatedProduct = { ...products[productIndex], ...req.body, id: products[productIndex].id };
  products[productIndex] = updatedProduct;
  writeProducts(products);
  res.status(200).json({ message: `Producto con ID:${pid} actualizado`, product: updatedProduct });
});

// Eliminar producto por ID
router.delete('/:pid', (req, res) => {
  const products = readProducts();
  const { pid } = req.params;
  const productIndex = products.findIndex(p => p.id === parseInt(pid));
  if (productIndex === -1) {
    return res.status(404).json({ message: `Producto con ID:${pid} no encontrado` });
  }
  products.splice(productIndex, 1);
  writeProducts(products);
  res.status(200).json({ message: `Producto con ID:${pid} eliminado` });
});

export default router;

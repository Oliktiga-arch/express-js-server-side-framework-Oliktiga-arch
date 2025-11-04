const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Custom error classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

// Custom logger middleware
const logger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Validation middleware for product creation/update
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }
  if (price === undefined || typeof price !== 'number' || price < 0) {
    errors.push('Price is required and must be a non-negative number');
  }
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  if (typeof inStock !== 'boolean') {
    errors.push('InStock must be a boolean');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  next();
};

// Middleware
app.use(logger);
app.use(bodyParser.json());

// In-memory storage for products
let products = [
  {
    id: uuidv4(),
    name: 'LED Bulb',
    description: 'Energy-efficient LED bulb',
    price: 9.99,
    category: 'Lighting',
    inStock: true
  },
  {
    id: uuidv4(),
    name: 'Smart Switch',
    description: 'WiFi-enabled smart switch',
    price: 29.99,
    category: 'Electronics',
    inStock: false
  }
];

// Hello World route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// RESTful routes for products
// GET /api/products: List all products with filtering, pagination, and search
app.get('/api/products', (req, res) => {
  let filteredProducts = [...products];

  // Filter by category
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === req.query.category.toLowerCase());
  }

  // Search by name
  if (req.query.search) {
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(req.query.search.toLowerCase()));
  }

  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json({
    products: paginatedProducts,
    total: filteredProducts.length,
    page,
    limit,
    totalPages: Math.ceil(filteredProducts.length / limit)
  });
});

// GET /api/products/:id: Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products: Create a new product
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id: Update an existing product
app.put('/api/products/:id', authenticate, validateProduct, (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const { name, description, price, category, inStock } = req.body;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (category !== undefined) product.category = category;
  if (inStock !== undefined) product.inStock = inStock;
  res.json(product);
});

// DELETE /api/products/:id: Delete a product
app.delete('/api/products/:id', authenticate, (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    throw new NotFoundError('Product not found');
  }
  products.splice(index, 1);
  res.status(204).send();
});

// GET /api/products/stats: Get product statistics
app.get('/api/products/stats', (req, res) => {
  const stats = {};
  products.forEach(product => {
    if (!stats[product.category]) {
      stats[product.category] = 0;
    }
    stats[product.category]++;
  });
  res.json({
    totalProducts: products.length,
    categoryCounts: stats
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ error: message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
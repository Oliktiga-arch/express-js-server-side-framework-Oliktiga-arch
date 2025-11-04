# Express.js RESTful API

A RESTful API built with Express.js that implements CRUD operations for products, middleware, and error handling.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` and set your API key:
   ```
   API_KEY=your-secret-api-key-here
   PORT=3000
   ```

3. Start the server:
   ```bash
   node server.js
   ```

The server will run on port 3000 by default.

## API Endpoints

### Products

#### GET /api/products
List all products with optional filtering, pagination, and search.

**Query Parameters:**
- `category` (string): Filter by category
- `search` (string): Search by product name
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of items per page (default: 10)

**Example:**
```
GET /api/products?category=lighting&page=1&limit=5
GET /api/products?search=led
```

#### GET /api/products/:id
Get a specific product by ID.

#### POST /api/products
Create a new product. Requires authentication.

**Headers:**
- `x-api-key`: Your API key

**Body:**
```json
{
  "name": "LED Bulb",
  "description": "Energy-efficient LED bulb",
  "price": 9.99,
  "category": "Lighting",
  "inStock": true
}
```

#### PUT /api/products/:id
Update an existing product. Requires authentication.

**Headers:**
- `x-api-key`: Your API key

**Body:** (same as POST, all fields optional for partial updates)

#### DELETE /api/products/:id
Delete a product. Requires authentication.

**Headers:**
- `x-api-key`: Your API key

#### GET /api/products/stats
Get product statistics (total count and count by category).

## Testing

You can test the API using tools like Postman, Insomnia, or curl.

### Example Requests

1. Get all products:
   ```bash
   curl http://localhost:3000/api/products
   ```

2. Create a product:
   ```bash
   curl -X POST http://localhost:3000/api/products \
     -H "Content-Type: application/json" \
     -H "x-api-key: your-api-key" \
     -d '{
       "name": "Smart Switch",
       "description": "WiFi-enabled smart switch",
       "price": 29.99,
       "category": "Electronics",
       "inStock": true
     }'
   ```

3. Get product statistics:
   ```bash
   curl http://localhost:3000/api/products/stats
   ```

## Error Handling

The API uses custom error classes and global error handling middleware. Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid API key)
- 404: Not Found
- 500: Internal Server Error

## Middleware

- **Logger**: Logs request method, URL, and timestamp
- **Body Parser**: Parses JSON request bodies
- **Authentication**: Checks for API key in headers
- **Validation**: Validates product data for POST/PUT requests
- **Error Handler**: Global error handling middleware
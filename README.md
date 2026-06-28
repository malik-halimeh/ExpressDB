# Restaurant API

This is a complete, production-quality NoSQL REST API backend for restaurant management, migrated from a PostgreSQL relational database system. The project is designed with Node.js, Express.js, and MongoDB, utilizing Mongoose ODM. It preserves original SQL records and constraints while demonstrating modern NoSQL best practices.

---

## 📖 Project Description

The **Restaurant API** serves as a direct document-oriented migration of a relational database structure. The primary goal is to translate tabular PostgreSQL entities into MongoDB collections without losing the original relational integrity.

To compare relational modeling directly against NoSQL document stores:
- **MongoDB references (ObjectIds)** are used to establish and populate all entity relationships (`Category` → `MenuItem`, `Customer` → `Order`, etc.).
- **Original SQL numeric IDs** (e.g. `category_id`, `item_id`) are preserved alongside ObjectIds to support migration verification and simplified testing.
- **Application-level constraint validations** (RESTRICT and CASCADE) are implemented in Node.js to mimic standard SQL database schema foreign key controls.

---

## ✨ Features

- **Decoupled Folder Structure**: Follows strict separation of concerns (routes, validators, controllers, models, middlewares).
- **ES Modules**: Written entirely using modern JavaScript ES module syntax (`import`/`export`).
- **Two-Layer Validation**: Implements structural HTTP request validations (`express-validator`) and database schema integrity protections (`Mongoose`).
- **Standardized Response Formatting**: All API responses use uniform JSON payload configurations for resources, paginated collections, and deletions.
- **Centralized Error Handling**: Transforms database constraints, cast types, and operational exceptions into standard HTTP error responses.
- **Offset Pagination**: Paging metadata is embedded on all GET ALL list endpoints.
- **Referential Integrity**: Implements custom validation, CASCADE deletes, and RESTRICT deletion rules in the controller layer.
- **Automatic Seed Mapping**: Migration scripts load, map, and verify relational structures into MongoDB documents.
- **Postman Collection**: Includes a pre-configured test suite.

---

## 🛠️ Technology Stack

- **Node.js**: Server runtime environment (v22.21.0 LTS)
- **Express.js**: Backend routing and controllers framework
- **MongoDB**: Document-oriented database
- **Mongoose**: Object Document Mapper (ODM)
- **express-validator**: Payload parsing and validation middleware
- **dotenv**: Environment variables configuration
- **cors**: Cross-Origin Resource Sharing handling
- **morgan**: Request logging middleware
- **nodemon**: Development live reload tool
- **npm**: Package manager

---

## 📥 Installation & Setup

Follow these steps to run the project locally:

### 1. Install Dependencies
Run the install command in the project root:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in the root folder to create a `.env` file:
```bash
cp .env.example .env
```
Open `.env` and configure:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/restaurant_api
NODE_ENV=development
```

### 3. Run the Seed Script
Populate your local MongoDB instance with the official historical dataset and map relationships:
```bash
npm run seed
```

### 4. Launch the API Server
Start the development server with nodemon:
```bash
npm run dev
```
The server will start listening at `http://localhost:5000`.

---

## 📁 Project Structure

```text
restaurant_api/
├── src/
│   ├── config/
│   │   └── database.js               # Database connection configurations
│   ├── controllers/
│   │   ├── categoryController.js     # Category requests handler
│   │   ├── customerController.js     # Customer requests handler
│   │   ├── menuItemController.js     # MenuItem requests handler
│   │   ├── orderController.js        # Order requests handler
│   │   └── orderItemController.js    # OrderItem requests handler
│   ├── models/
│   │   ├── Category.js               # Category Mongoose schema
│   │   ├── Customer.js               # Customer Mongoose schema
│   │   ├── MenuItem.js               # MenuItem Mongoose schema
│   │   ├── Order.js                  # Order Mongoose schema
│   │   └── OrderItem.js              # OrderItem Mongoose schema
│   ├── routes/
│   │   ├── categoryRoutes.js         # Category router
│   │   ├── customerRoutes.js         # Customer router
│   │   ├── menuItemRoutes.js         # MenuItem router
│   │   ├── orderRoutes.js            # Order router
│   │   ├── orderItemRoutes.js        # OrderItem router
│   │   └── index.js                  # Master API router
│   ├── validators/
│   │   ├── categoryValidator.js      # Category express-validator schemas
│   │   ├── customerValidator.js      # Customer express-validator schemas
│   │   ├── menuItemValidator.js      # MenuItem express-validator schemas
│   │   ├── orderValidator.js         # Order express-validator schemas
│   │   ├── orderItemValidator.js     # OrderItem express-validator schemas
│   │   └── validate.js               # express-validator collector middleware
│   ├── middlewares/
│   │   ├── asyncHandler.js           # Exception handler wrapper
│   │   ├── errorHandler.js           # Central global error formatter
│   │   ├── notFound.js               # Unregistered route handler (404)
│   │   └── requestLogger.js          # HTTP requests logger
│   ├── utils/
│   │   ├── ApiResponse.js            # Standard API response class
│   │   ├── AppError.js               # Custom operational error class
│   │   ├── pagination.js             # Pagination computations helper
│   │   └── constants.js              # Sorting and collection name constants
│   ├── seed/
│   │   ├── seedData/                 # Original seed source JSON files
│   │   └── seedDatabase.js           # Seeding and ObjectId mapping script
│   ├── docs/
│   │   ├── PROJECT_GUIDE.md          # Educational study guide
│   │   └── ARCHITECTURE.md           # Mermaid system diagrams
│   ├── app.js                        # Express configurations mounting
│   └── server.js                     # Port listener and startup script
├── .env.example                      # Environment variables template
├── .gitignore                        # Files to ignore in Git
├── package.json                      # npm manifest configurations
├── README.md                         # Project documentation
└── Restaurant_API_Postman_Collection.json # Postman collection file
```

---

## 🗄️ Database & Schema Overview

The database contains exactly five collections representing the relational mappings:

1. **categories**: `category_id` (Number, unique), `category_name` (String, unique, required), `description` (String).
2. **customers**: `customer_id` (Number, unique), `customer_name` (String, required), `phone_number` (String), `address` (String).
3. **menuitems**: `item_id` (Number, unique), `item_name` (String, required), `price` (Number, required, >=0), `category` (ObjectId referencing Category), `description` (String), `image_url` (String), `is_available` (Boolean).
4. **orders**: `order_id` (Number, unique), `customer` (ObjectId referencing Customer), `order_date` (Date, default now), `total_amount` (Number, >=0).
5. **orderitems**: `order_item_id` (Number, unique), `order` (ObjectId referencing Order), `menuItem` (ObjectId referencing MenuItem), `quantity` (Number, required, >0), `unit_price` (Number, required, >=0).

---

## 📋 API Endpoints

All endpoints are prefixed with `/api`. For individual resources, pass the MongoDB ObjectId (e.g. `65f012345678901234567890`) in the route parameter.

| Resource | Method | URL Path | Description |
| :--- | :--- | :--- | :--- |
| **Categories** | `POST` | `/api/categories` | Create Category (returns `201`) |
| | `GET` | `/api/categories` | List Categories (paginated) |
| | `GET` | `/api/categories/:id` | Fetch Category by ObjectId |
| | `PUT` | `/api/categories/:id` | Update Category by ObjectId |
| | `DELETE` | `/api/categories/:id` | Delete Category (**RESTRICT** checks) |
| **Customers** | `POST` | `/api/customers` | Create Customer (returns `201`) |
| | `GET` | `/api/customers` | List Customers (paginated) |
| | `GET` | `/api/customers/:id` | Fetch Customer by ObjectId |
| | `PUT` | `/api/customers/:id` | Update Customer by ObjectId |
| | `DELETE` | `/api/customers/:id` | Delete Customer (**RESTRICT** checks) |
| **Menu Items** | `POST` | `/api/menu-items` | Create MenuItem (checks Category exists) |
| | `GET` | `/api/menu-items` | List MenuItems (paginated) |
| | `GET` | `/api/menu-items/:id` | Fetch MenuItem by ObjectId |
| | `PUT` | `/api/menu-items/:id` | Update MenuItem by ObjectId |
| | `DELETE` | `/api/menu-items/:id` | Delete MenuItem (**RESTRICT** checks) |
| **Orders** | `POST` | `/api/orders` | Create Order (checks Customer exists) |
| | `GET` | `/api/orders` | List Orders (paginated, sorted by date) |
| | `GET` | `/api/orders/:id` | Fetch Order (populates Customer details) |
| | `PUT` | `/api/orders/:id` | Update Order by ObjectId |
| | `DELETE` | `/api/orders/:id` | Delete Order (**CASCADE** deletes items) |
| **Order Items** | `POST` | `/api/order-items` | Create OrderItem (checks Order/MenuItem) |
| | `GET` | `/api/order-items` | List OrderItems (paginated) |
| | `GET` | `/api/order-items/:id` | Fetch OrderItem (populates Order/MenuItem) |
| | `PUT` | `/api/order-items/:id` | Update OrderItem by ObjectId |
| | `DELETE` | `/api/order-items/:id` | Delete OrderItem by ObjectId |

---

## 🧪 Testing

### Postman Integration
Import the pre-configured [Restaurant_API_Postman_Collection.json](./Restaurant_API_Postman_Collection.json) into Postman:
1. Click **Import** inside Postman.
2. Select the `Restaurant_API_Postman_Collection.json` file.
3. The collection is configured to query using the `baseUrl` variable. You can adjust the variable inside the collection options if running on a custom port.

---

## 🔮 Future Improvements
*(These additions are optional and excluded from the core requirements)*
- JWT Authentication and user login/registration.
- Detailed restaurant table reservations booking module.
- Image uploads handling via middleware for MenuItem attachments.

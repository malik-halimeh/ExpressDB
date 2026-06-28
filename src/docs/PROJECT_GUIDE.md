# Restaurant API Project Guide

Welcome to the **Restaurant API** codebase! This guide is designed to help you understand the architectural patterns, files, and engineering decisions implemented in this NoSQL backend system. It serves as an educational resource to master Express.js, MongoDB, and Mongoose modeling.

---

## Section 1: Project Overview

The **Restaurant API** is a complete, production-quality NoSQL backend migration of a legacy PostgreSQL restaurant database. The objective is to transition from a relational schema to a document-oriented database using MongoDB + Mongoose, while preserving the original database structure, historical numeric IDs, and constraints.

Rather than redesigning the schema into nested document structures, this project mirrors the relational architecture using **Mongoose references (ObjectIds)**. This serves as a teaching mechanism to compare SQL constraints (e.g., primary keys, foreign keys, restrict/cascade behaviors) directly against equivalent application-level validations in Node.js.

---

## Section 2: How to Read This Project

If you are opening this project for the first time, we recommend studying the files in the following sequence. This order starts with the high-level configurations and follows the request execution chain down to the database:

1. [README.md](../../README.md) - Project overview and environment setup.
2. [package.json](../../package.json) - Node scripts and external dependencies configuration.
3. [src/server.js](../server.js) - Application entry point responsible for starting the server and connecting to MongoDB.
4. [src/app.js](../app.js) - Express configuration mounting global middlewares and error handlers.
5. [src/config/database.js](../config/database.js) - Mongoose connection events and graceful shutdown logic.
6. [src/routes/index.js](../routes/index.js) - Master router mapping endpoint paths to sub-routers.
7. [src/validators/validate.js](../validators/validate.js) - express-validator interceptor middleware.
8. [src/validators/customerValidator.js](../validators/customerValidator.js) - Structural request body validation chains.
9. [src/controllers/customerController.js](../controllers/customerController.js) - Request execution controllers.
10. [src/models/Customer.js](../models/Customer.js) - Mongoose schema structure and database layer constraints.
11. [src/middlewares/errorHandler.js](../middlewares/errorHandler.js) - Global exception formats.
12. [src/seed/seedDatabase.js](../seed/seedDatabase.js) - Relational migration seed mapping.

---

## Section 3: Folder Walkthrough

### `src/config/`
- **Purpose**: Configuration files.
- **Files**: `database.js`
- **Responsibilities**: Establish connections to MongoDB and hook connection events.
- **Beginner Mistakes**: Putting route definitions or server listening ports inside this directory. Keep it limited to connection config.

### `src/controllers/`
- **Purpose**: Process request logic.
- **Files**: `categoryController.js`, `customerController.js`, `menuItemController.js`, `orderController.js`, `orderItemController.js`
- **Responsibilities**: Query databases using models, enforce check constraints, and send structured JSON responses using the `ApiResponse` utility.
- **Beginner Mistakes**: Writing input format validation inside controllers. All validations must be completed at the middleware layer before hitting controllers.

### `src/models/`
- **Purpose**: Define database schemas.
- **Files**: `Category.js`, `Customer.js`, `MenuItem.js`, `Order.js`, `OrderItem.js`
- **Responsibilities**: Outline fields, datatypes, indexing, and Mongoose-level validation rules.
- **Beginner Mistakes**: Storing nested business logic or executing HTTP request validations here. Keep it focused on database structures.

### `src/routes/`
- **Purpose**: Mapping API paths.
- **Files**: `categoryRoutes.js`, `customerRoutes.js`, `menuItemRoutes.js`, `orderRoutes.js`, `orderItemRoutes.js`, `index.js`
- **Responsibilities**: Wire HTTP request paths to validator chains and controllers.
- **Beginner Mistakes**: Writing business logic or executing database calls inside route files. Keep routes to single-line bindings.

### `src/validators/`
- **Purpose**: Validate request body structures.
- **Files**: `validate.js` (collector), `categoryValidator.js`, `customerValidator.js`, `menuItemValidator.js`, `orderValidator.js`, `orderItemValidator.js`
- **Responsibilities**: Enforce types, limits, mandatory fields, and formats.
- **Beginner Mistakes**: Accessing the database (e.g. checking if a Category exists). Database queries belong in controllers.

### `src/middlewares/`
- **Purpose**: Generic request filters.
- **Files**: `asyncHandler.js`, `errorHandler.js`, `notFound.js`, `requestLogger.js`
- **Responsibilities**: Encapsulate cross-cutting concerns like promise resolution, exception logging, and invalid path handling.
- **Beginner Mistakes**: Writing entity-specific logic here. Keep middleware reusable.

### `src/utils/`
- **Purpose**: Helpers.
- **Files**: `ApiResponse.js`, `AppError.js`, `pagination.js`, `constants.js`
- **Responsibilities**: Standardize responses, encapsulate custom operational errors, and calculate offsets.

---

## Section 4: Request Lifecycle

When a client sends a request to create a Customer via `POST /api/customers`, it undergoes this lifecycle:

1. **Client Request**: The client sends a JSON body to `POST /api/customers`.
2. **Express Engine**: Express parses the HTTP request and runs global middlewares (CORS, JSON parser, Morgan logger).
3. **Route Resolver**: Match goes to `src/routes/customerRoutes.js`.
4. **Validation Layer 1 (express-validator)**: `customerCreateValidator` runs, verifying `customer_id` is a positive integer and `customer_name` is present.
5. **Validation Middleware (`validate.js`)**: Inspects express-validator results. If errors are found, it terminates the request with `400 Bad Request` and details.
6. **Controller Layer (`customerController.js`)**: Wraps in `asyncHandler`. Calls `Customer.create(req.body)`.
7. **Validation Layer 2 (Mongoose)**: Before Mongoose saves, it verifies schemas rules (e.g., uniqueness of `customer_id`). If violated, an error is thrown.
8. **MongoDB Layer**: Document is saved in `customers` collection.
9. **JSON Response**: Controller receives the new document and calls `ApiResponse.success(...)` returning a `201 Created` status.
10. **Error Catch (Global Error Middleware)**: If a duplicate `customer_id` error is thrown at step 7, it bypasses the controller and goes directly to the global error middleware, returning a `409 Conflict`.

---

## Section 5: CRUD Walkthrough

The CRUD pattern is implemented uniformly across all controllers. Here is an example of the workflow:

- **Create (POST)**: Validates input with `express-validator` -> verifies related references exist (if applicable) -> inserts document via Model -> returns `201` success JSON.
- **Read All (GET)**: Computes offsets using `getPagination()` -> queries documents with `.skip().limit()` -> calculates pages -> returns `200` collection format JSON.
- **Read One (GET)**: Fetches document by MongoDB `_id` -> populates virtuals -> throws `404` AppError if not found -> returns `200` success JSON.
- **Update (PUT)**: Checks database existence -> verifies updated reference ObjectIds -> runs `findOneAndUpdate` with `runValidators: true` -> returns `200` success JSON.
- **Delete (DELETE)**: Verifies target existence -> checks delete rules (RESTRICT blocks, CASCADE wipes children) -> deletes document -> returns standard `200` delete message.

---

## Section 6: Relationship Walkthrough

We preserve SQL schema associations using MongoDB ObjectId references (`ref` keyword):

- **Category → MenuItem.category**: stored as Mongoose ObjectId referencing `Category`.
- **Customer → Order.customer**: stored as Mongoose ObjectId referencing `Customer`.
- **Order → OrderItem.order**: stored as Mongoose ObjectId referencing `Order`.
- **MenuItem → OrderItem.menuItem**: stored as Mongoose ObjectId referencing `MenuItem`.

### ObjectId Population
We use Mongoose `.populate()` to expand reference ObjectIds into their corresponding document data during query execution. For example, when fetching OrderItems:
```javascript
const item = await OrderItem.findById(id).populate('order').populate('menuItem');
```
This returns the full Order and MenuItem documents inside the OrderItem response, providing optimal API usability without duplicating data.

### Why Embedding Was Avoided
To mirror the SQL relational structure exactly and comply with the PostgreSQL schema guidelines, embedding was intentionally bypassed. Embedding OrderItems inside Orders, or MenuItems inside Categories, would result in duplicate, disjointed documents and violate direct database migration tracking.

---

## Section 7: Validation Walkthrough

Our architecture implements **two independent validation layers**:

1. **Validation Layer 1: Request Validation (express-validator)**:
   - Evaluates incoming request parameters prior to controller invocation. It checks fields formats, formats types, positive bounds, and empty strings.
   - Example:
     ```javascript
     body('price').exists().isFloat({ min: 0 })
     ```
2. **Validation Layer 2: Schema Validation (Mongoose)**:
   - Safeguards database integrity at the model layer during database writes (`save()`, `create()`, etc.).
   - Example:
     ```javascript
     price: { type: Number, min: 0 }
     ```

---

## Section 8: Error Handling Walkthrough

Centralized error handling is built using the following core modules:

- **AppError**: A custom class representing expected errors (e.g. 404 resource not found).
- **asyncHandler**: Catches promise rejections inside controllers and transfers them to the Express error chain.
- **Global Error Middleware (`errorHandler.js`)**: Formats exceptions into standard client JSON structures:
  - **CastError**: Catches malformed ObjectIds and returns `400 Bad Request` with message `'Invalid resource identifier.'`.
  - **Duplicate Key Error (code 11000)**: Formats MongoDB duplicates into `409 Conflict` (e.g., `'Category Name already exists.'`).
  - **Mongoose ValidationError**: Aggregates all schema write errors into an object map.

---

## Section 9: Database Walkthrough

The database contains exactly **five** collections:

1. **categories**: Stores food categories.
   - Preserves `category_id` (Number, unique) alongside MongoDB `_id` (ObjectId).
   - Validates `category_name` is unique and trimmed.
2. **customers**: Stores customer profiles.
   - Preserves `customer_id` (Number, unique).
   - Stores name, address, and phone numbers.
3. **menuitems**: Stores restaurant menu cards.
   - Preserves `item_id` (Number, unique).
   - Fields: `item_name`, `price`, `description`, `image_url`, `is_available`, and `category` (ObjectId ref to Category).
4. **orders**: Stores restaurant orders.
   - Preserves `order_id` (Number, unique).
   - Fields: `order_date`, `total_amount` (CHECK price >= 0), and `customer` (ObjectId ref to Customer).
5. **orderitems**: Stores ordered items.
   - Preserves `order_item_id` (Number, unique).
   - Fields: `quantity` (CHECK > 0), `unit_price` (CHECK >= 0), `order` (ObjectId ref to Order), and `menuItem` (ObjectId ref to MenuItem).

---

## Section 10: Seed Script Walkthrough

The seeding system (`seedDatabase.js`) executes in a sequential workflow to map integer SQL references to generated MongoDB ObjectIds:

1. **Clean Collections**: Safely wipes existing collections to prevent constraint collisions.
2. **Import Categories**: Inserts categories and saves the mapping from integer `category_id` to generated `_id`.
3. **Import Customers**: Inserts customers and saves the mapping from `customer_id` to generated `_id`.
4. **Import Menu Items**: Iterates through menu items, replacing raw SQL `category_id` references with mapped Category ObjectIds, then inserts them.
5. **Import Orders**: Iterates through orders, replacing SQL `customer_id` with Customer ObjectIds.
6. **Import Order Items**: Replaces SQL `order_id` and `item_id` with mapped Order and MenuItem ObjectIds.
7. **Verification**: Compares record lengths and prints counts.

---

## Section 11: Learning Roadmap

To master this architecture:
1. Review [README.md](../../README.md) to understand overall installation.
2. Trace [src/server.js](../server.js) to see application initialization.
3. Trace [src/app.js](../app.js) to understand middlewares.
4. Open [src/routes/index.js](../routes/index.js) and see the path routing structure.
5. Inspect [src/validators/categoryValidator.js](../validators/categoryValidator.js) to study express-validator chains.
6. Study [src/controllers/categoryController.js](../controllers/categoryController.js) to understand controller actions.
7. Study Mongoose model configurations in [src/models/Category.js](../models/Category.js).
8. Trace [src/middlewares/errorHandler.js](../middlewares/errorHandler.js) to examine exception formats.
9. Open [src/seed/seedDatabase.js](../seed/seedDatabase.js) to review the SQL migration process.

---

## Section 12: Common Beginner Mistakes

- **Confusing SQL IDs with MongoDB ObjectIds**: Beginners use SQL numeric IDs for Mongoose references. In this project, relationships are established exclusively via ObjectIds; integer IDs exist only for migration compatibility.
- **Putting validation inside controllers**: Keeps controllers bloated and duplicates validation chains. In this project, express-validator cleans the payload before the controller runs.
- **Mixing CommonJS with ES Modules**: Leads to runtime require crashes. This project strictly implements ES Modules (`import`/`export`).
- **Embedding documents unnecessarily**: Embedding relational models makes it difficult to query entities independently and violates migration specs.

---

## Section 13: Glossary

- **REST API**: Representational State Transfer Web service exposing endpoints matching standard actions.
- **CRUD**: Create, Read, Update, and Delete actions.
- **Mongoose ODM**: Object Document Mapper translating MongoDB documents to JavaScript objects.
- **express-validator**: Middleware package wrapping validation logic for HTTP payloads.
- **AppError**: A custom error class mapping expected runtime errors.
- **populate()**: Mongoose utility to query and replace references with full documents.

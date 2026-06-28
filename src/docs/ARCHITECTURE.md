# Restaurant API Architecture

This document visually details the architecture, startup flows, request lifecycles, databases relationships, and directory dependencies of the **Restaurant API** application.

---

## Section 1: High-Level Architecture

The API implements a decoupled multi-layered architecture where each concern is isolated into dedicated modules.

```mermaid
graph TD
    Client["Client Request"] --> Express["Express Framework"]
    Express --> Routes["Routes Layer"]
    Routes --> Validators["Validators Layer"]
    Validators --> Controllers["Controllers Layer"]
    Controllers --> Models["Models Layer (Mongoose)"]
    Models --> MongoDB[("MongoDB Database")]
    Controllers --> ApiResponse["ApiResponse Utility"]
    ApiResponse --> ClientResponse["JSON Response"]
```

### Flow Breakdown
- **Client Request**: Initiated by a web client or API tool.
- **Express**: Parses requests, applies CORS, logs details, and matches endpoints.
- **Routes**: Directs URL paths to the appropriate middlewares and controller hooks.
- **Validators**: Structural checks are executed before reaching controller logic.
- **Controllers**: Invokes model operations and implements relational integrity validation.
- **Models**: Maps documents to JavaScript entities and writes to MongoDB.
- **ApiResponse**: Builds standard JSON structures.

---

## Section 2: Application Startup Flow

The server boots in a deterministic, sequential execution starting from `server.js`.

```mermaid
sequenceDiagram
    participant S as server.js
    participant DB as src/config/database.js
    participant A as src/app.js
    participant R as src/routes/index.js
    
    S->>DB: Connect to MongoDB (connectDB)
    DB-->>S: Connection Successful
    S->>A: Load Express instance
    A->>R: Bind routes and error handlers
    S->>S: Server starts listening on configured PORT
```

### Stage Explanations
1. **Uncaught Exceptions Handler**: Catches any synchronous initialization failures.
2. **Environment Variables Loading**: Load values (e.g. `MONGO_URI`, `PORT`) via `dotenv`.
3. **Database Connection**: Calls Mongoose connection handler. Server listening is blocked until the connection succeeds.
4. **App Initialization**: Initializes Express middlewares (CORS, Morgan, JSON).
5. **Listen**: Listens on the designated PORT.

---

## Section 3: Request Lifecycle

This sequence diagram charts a single request traversing the API.

```mermaid
sequenceDiagram
    actor C as Client
    participant E as Express Router
    participant V as express-validator
    participant M as validate middleware
    participant CO as Controller
    participant MO as Mongoose Model
    participant DB as MongoDB
    
    C->>E: POST /api/categories
    E->>V: Validate request body
    V-->>E: Validation results
    E->>M: Check errors
    alt Validation Failed
        M-->>C: 400 Bad Request (JSON Error Map)
    else Validation Passed
        E->>CO: Invoke createCategory
        CO->>MO: Invoke Category.create()
        MO->>MO: Execute Schema validations
        alt Database Schema Validation Failed
            MO-->>CO: Throw validation error
            CO-->>C: Redirected to errorHandler (400/409)
        else Database Write Succeeded
            MO->>DB: Save document
            DB-->>MO: Document saved
            MO-->>CO: Return document
            CO-->>C: 201 Created (JSON Response)
        end
    end
```

---

## Section 4: Database Relationships

Relationships use MongoDB ObjectId references (`ref` keyword). Preserved SQL integer IDs are stored only as informational fields.

```mermaid
erDiagram
    Category ||--o{ MenuItem : "referenced via category ObjectId"
    Customer ||--o{ Order : "referenced via customer ObjectId"
    Order ||--o{ OrderItem : "referenced via order ObjectId"
    MenuItem ||--o{ OrderItem : "referenced via menuItem ObjectId"

    Category {
        ObjectId _id PK
        Number category_id
        String category_name
        String description
    }
    
    Customer {
        ObjectId _id PK
        Number customer_id
        String customer_name
        String phone_number
        String address
    }
    
    MenuItem {
        ObjectId _id PK
        Number item_id
        String item_name
        Number price
        ObjectId category FK
        String description
        String image_url
        Boolean is_available
    }
    
    Order {
        ObjectId _id PK
        Number order_id
        ObjectId customer FK
        Date order_date
        Number total_amount
    }
    
    OrderItem {
        ObjectId _id PK
        Number order_item_id
        ObjectId order FK
        ObjectId menuItem FK
        Number quantity
        Number unit_price
    }
```

---

## Section 5: Folder Dependency Graph

The directory dependency graph flows unidirectionally from entry controllers down to databases models. Middlewares and utilities act as support libraries.

```mermaid
graph TD
    server["src/server.js"] --> app["src/app.js"]
    server --> dbConfig["src/config/database.js"]
    app --> routes["src/routes/"]
    routes --> validators["src/validators/"]
    routes --> controllers["src/controllers/"]
    controllers --> models["src/models/"]
    models --> db[("MongoDB")]
    controllers --> utils["src/utils/"]
    app --> middlewares["src/middlewares/"]
```

---

## Section 6: Error Handling Flow

Centralized error handling routes all caught exceptions to a single formatting middleware.

```mermaid
graph TD
    Controller["Controller Function"] -->|Exception thrown| asyncHandler["asyncHandler Wrapper"]
    asyncHandler -->|Calls next err| GlobalErr["Global Error Handler Middleware"]
    GlobalErr -->|Evaluates error types| Format["Format Exception (CastError, DuplicateKey, ValidationError)"]
    Format -->|Return standardized payload| JSON["JSON Error Response"]
```

---

## Section 7: Validation Flow

Input validation is structured in two separate barriers to guarantee maximum database integrity.

```mermaid
graph TD
    Request["Client Request"] --> Layer1["Layer 1: express-validator"]
    Layer1 -->|Intercepts missing / bad data| Validate["validate.js middleware"]
    Validate -->|Validation fails| JSON["400 Bad Request JSON Response"]
    Validate -->|Validation passes| Controller["Controller Layer"]
    Controller -->|Calls Mongoose| Layer2["Layer 2: Mongoose Schema Validation"]
    Layer2 -->|Schema validations fail| ErrHandler["Global Error Handler"]
    Layer2 -->|Validations pass| Save["Save Document to MongoDB"]
```

---

## Section 8: Seed Process

The seeding database script parses original JSON files and maps relational structures in logical order to prevent orphan keys.

```mermaid
graph TD
    JSON["seedData/*.json"] --> Seed["seedDatabase.js"]
    Seed --> Wipe["Wipe Existing MongoDB Collections"]
    Wipe --> InsertCat["Insert Categories"]
    InsertCat --> MapCat["Map category_id to Category ObjectIds"]
    MapCat --> InsertCust["Insert Customers"]
    InsertCust --> MapCust["Map customer_id to Customer ObjectIds"]
    MapCust --> InsertItems["Insert MenuItems (with mapped Category ObjectIds)"]
    InsertItems --> MapItems["Map item_id to MenuItem ObjectIds"]
    MapItems --> InsertOrders["Insert Orders (with mapped Customer ObjectIds)"]
    InsertOrders --> MapOrders["Map order_id to Order ObjectIds"]
    MapOrders --> InsertOrderItems["Insert OrderItems (with mapped Order & MenuItem ObjectIds)"]
    InsertOrderItems --> Verify["Verify Collections Counts & Relationships"]
    Verify --> Disconnect["Disconnect Database and Exit"]
```

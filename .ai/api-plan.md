# REST API Plan

## 1. Resources
- **Users** - maps to `users` table
- **Authentication** - handles user registration and login
- **Shopping Lists** - maps to `shopping_lists` table
- **Shopping List Items** - maps to `shopping_list_items` table

## 2. Endpoints

### Authentication

#### Register User
- **Method**: POST
- **Path**: `/api/auth/register`
- **Description**: Register a new user in the system
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "registrationDate": "timestamp",
    "token": "string"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 409 Conflict - Email already exists

#### Login User
- **Method**: POST
- **Path**: `/api/auth/login`
- **Description**: Authenticate a user and receive an access token
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "token": "string"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Invalid credentials

### Users

#### Get All Users
- **Method**: GET
- **Path**: `/api/users`
- **Description**: Retrieve a list of all users (admin only)
- **Query Parameters**:
  - `page` (integer, default: 1) - Page number
  - `pageSize` (integer, default: 20) - Number of items per page
  - `sort` (string, optional) - Field to sort by (email, registrationDate)
  - `order` (string, optional) - Sort order (asc, desc)
  - `emailFilter` (string, optional) - Filter by email pattern
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "email": "string",
        "registrationDate": "timestamp",
        "lastLoginDate": "timestamp"
      }
    ],
    "pagination": {
      "totalItems": "integer",
      "totalPages": "integer",
      "currentPage": "integer",
      "pageSize": "integer"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (non-admin)

#### Get User by ID
- **Method**: GET
- **Path**: `/api/users/{id}`
- **Description**: Retrieve a specific user by ID
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "registrationDate": "timestamp",
    "lastLoginDate": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized
  - 404 Not Found - User not found

#### Update User
- **Method**: PUT
- **Path**: `/api/users/{id}`
- **Description**: Update a user's information
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "updatedDate": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized
  - 404 Not Found - User not found
  - 409 Conflict - Email already exists

#### Delete User
- **Method**: DELETE
- **Path**: `/api/users/{id}`
- **Description**: Delete a user account
- **Response Body**: No content
- **Success Codes**: 204 No Content
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized
  - 404 Not Found - User not found

### Shopping Lists

#### Get All Shopping Lists
- **Method**: GET
- **Path**: `/api/shopping-lists`
- **Description**: Retrieve all shopping lists belonging to the authenticated user
- **Query Parameters**:
  - `page` (integer, default: 1) - Page number
  - `pageSize` (integer, default: 20) - Number of items per page
  - `sort` (string, optional) - Field to sort by (title, createdAt, updatedAt)
  - `order` (string, optional) - Sort order (asc, desc)
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "itemCount": "integer"
      }
    ],
    "pagination": {
      "totalItems": "integer",
      "totalPages": "integer",
      "currentPage": "integer",
      "pageSize": "integer"
    }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Not authenticated

#### Get Shopping List by ID
- **Method**: GET
- **Path**: `/api/shopping-lists/{id}`
- **Description**: Retrieve a specific shopping list with its items
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "items": [
      {
        "id": "uuid",
        "itemName": "string",
        "purchased": "boolean",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List not found

#### Create Shopping List
- **Method**: POST
- **Path**: `/api/shopping-lists`
- **Description**: Create a new shopping list
- **Request Body**:
  ```json
  {
    "title": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated

#### Update Shopping List
- **Method**: PUT
- **Path**: `/api/shopping-lists/{id}`
- **Description**: Update a shopping list's title
- **Request Body**:
  ```json
  {
    "title": "string"
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "title": "string",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List not found

#### Delete Shopping List
- **Method**: DELETE
- **Path**: `/api/shopping-lists/{id}`
- **Description**: Delete a shopping list and all its items
- **Response Body**: No content
- **Success Codes**: 204 No Content
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List not found

### Shopping List Items

#### Get All Items in a Shopping List
- **Method**: GET
- **Path**: `/api/shopping-lists/{listId}/items`
- **Description**: Retrieve all items in a specific shopping list
- **Query Parameters**:
  - `purchased` (boolean, optional) - Filter by purchase status
  - `sort` (string, optional) - Field to sort by (itemName, purchased, createdAt)
  - `order` (string, optional) - Sort order (asc, desc)
- **Response Body**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "itemName": "string",
        "purchased": "boolean",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List not found

#### Get Shopping List Item by ID
- **Method**: GET
- **Path**: `/api/shopping-lists/{listId}/items/{itemId}`
- **Description**: Retrieve a specific item from a shopping list
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "itemName": "string",
    "purchased": "boolean",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List or item not found

#### Add Item to Shopping List
- **Method**: POST
- **Path**: `/api/shopping-lists/{listId}/items`
- **Description**: Add a new item to a shopping list
- **Request Body**:
  ```json
  {
    "itemName": "string",
    "purchased": "boolean" // optional, defaults to false
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "itemName": "string",
    "purchased": "boolean",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List not found

#### Update Shopping List Item
- **Method**: PUT
- **Path**: `/api/shopping-lists/{listId}/items/{itemId}`
- **Description**: Update a shopping list item
- **Request Body**:
  ```json
  {
    "itemName": "string", // optional
    "purchased": "boolean" // optional
  }
  ```
- **Response Body**:
  ```json
  {
    "id": "uuid",
    "itemName": "string",
    "purchased": "boolean",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List or item not found

#### Delete Shopping List Item
- **Method**: DELETE
- **Path**: `/api/shopping-lists/{listId}/items/{itemId}`
- **Description**: Remove an item from a shopping list
- **Response Body**: No content
- **Success Codes**: 204 No Content
- **Error Codes**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List or item not found

#### Bulk Update Items
- **Method**: PATCH
- **Path**: `/api/shopping-lists/{listId}/items`
- **Description**: Update multiple items in a shopping list at once
- **Request Body**:
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "purchased": "boolean"
      }
    ]
  }
  ```
- **Response Body**:
  ```json
  {
    "updatedCount": "integer",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized (not owner)
  - 404 Not Found - List not found

## 3. Authentication and Authorization

The API will use JWT (JSON Web Token) based authentication implemented through Supabase Auth.

### Authentication Flow
1. Users register or login through the `/api/auth` endpoints
2. Upon successful authentication, a JWT token is returned
3. For subsequent requests, clients must include this token in the Authorization header:
   `Authorization: Bearer {token}`

### Authorization Rules
- Users can only access and modify their own resources (shopping lists and items)
- Admin users can access the user management endpoints
- Unauthenticated requests are rejected with 401 Unauthorized responses
- Requests to resources owned by other users are rejected with 403 Forbidden responses

## 4. Validation and Business Logic

### User Validation
- Email must be a valid format
- Email must be unique in the system
- Password must meet security requirements (minimum 8 characters, combination of letters, numbers, and special characters)
- Passwords are stored as secure hashes, not plaintext

### Shopping List Validation
- Title is required and must be between 1-255 characters
- Each user can have multiple shopping lists
- Shopping lists are private to their owners

### Shopping List Item Validation
- Item name is required
- Items can only belong to one shopping list
- Purchase status is a boolean flag (true/false)

### Business Logic Implementation
- When a user is deleted, all associated shopping lists and items are automatically deleted (CASCADE)
- Shopping list creation date and updated date are automatically managed
- Item creation date and updated date are automatically managed
- API endpoints support filtering, sorting, and pagination where appropriate
- The system enforces ownership validation to ensure users can only access their own data 
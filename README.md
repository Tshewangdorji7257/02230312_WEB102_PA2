# Pokémon Catching API

This is a simple REST API for managing users and their caught Pokémon. It uses Hono as the web framework, Prisma as the ORM, and JWT for authentication.

## Features

- User registration and login
- JWT authentication for protected routes
- Fetch Pokémon data from an external API
- Catch and release Pokémon (protected routes)
- Retrieve caught Pokémon (protected routes)

## Technologies

- [Hono](https://honojs.dev/)
- [Prisma](https://www.prisma.io/)
- [JWT](https://jwt.io/)
- [Axios](https://axios-http.com/)
- [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Bun (v0.1.2 or higher)
- A PostgreSQL database

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/pokemon-catching-api.git
    cd pokemon-catching-api
    ```

2. Install dependencies:
    npm install
    

3. Configure your database connection in `prisma/.env`:

    ```dotenv
    DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase"
    ```

4. Run Prisma migrations:

    ```bash
    npx prisma migrate dev
    ```

5. Start the server:

    ```bash
    npm start
    ```

## API Endpoints

### Public Endpoints

#### Register a new user

- **URL:** `/register`
- **Method:** `POST`
- **Body:**
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ![Screenshot 2024-06-19 034037](https://github.com/Tshewangdorji7257/02230312_WEB102_PA2/assets/141105711/d557f41a-cd37-4225-a006-cb22333e6a32)

User login
URL: /login
Method: POST
Body:
json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
![Screenshot 2024-06-19 034124](https://github.com/Tshewangdorji7257/02230312_WEB102_PA2/assets/141105711/7b380796-a873-4f9c-9ceb-e21e2b5eb043)

Fetch Pokémon data
URL: /pokemon/:name
Method: GET
![Screenshot 2024-06-19 034323](https://github.com/Tshewangdorji7257/02230312_WEB102_PA2/assets/141105711/2fdc366d-6afb-45b1-b16a-15cccaf60d90)

Protected Endpoints
Catch a Pokémon
URL: /protected/catch
Method: POST
Headers:
{
  "name": "pikachu"
}
![Screenshot 2024-06-19 034456](https://github.com/Tshewangdorji7257/02230312_WEB102_PA2/assets/141105711/defb7941-5bc7-43df-a106-869534b10f7e)

Release a Pokémon
URL: /protected/release/:id
Method: DELETE
Headers:
![Screenshot 2024-06-19 034637](https://github.com/Tshewangdorji7257/02230312_WEB102_PA2/assets/141105711/e3538cd2-c0a6-4db2-9721-464b70471c8a)

Retrieve caught Pokémon
URL: /protected/caught
Method: GET
Headers:
![Screenshot 2024-06-19 035301](https://github.com/Tshewangdorji7257/02230312_WEB102_PA2/assets/141105711/d79500e8-2bc7-4098-a9d7-d5d603a5a667)


Error Handling
The API uses HTTP status codes to indicate the success or failure of an API request. Common status codes include:

200 OK: The request was successful.
400 Bad Request: The request was invalid or cannot be served.
401 Unauthorized: Authentication is required and has failed or has not yet been provided.
404 Not Found: The requested resource could not be found.
500 Internal Server Error: An error occurred on the server.

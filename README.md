# Smart Expense Tracker

A personal expense management application built with Java,
Spring Boot, MySQL, HTML, CSS, and JavaScript.

## Technologies Used

- Java
- Spring Boot
- Spring Data JPA
- MySQL
- HTML, CSS, JavaScript
- Maven
- Postman
- JUnit

## REST API Documentation

### Base URL

http://localhost:8080/api/v1/transactions

### API Endpoints

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| GET    | /api/v1/transactions      | Get all transactions  |
| GET    | /api/v1/transactions/{id} | Get transaction by ID |
| POST   | /api/v1/transactions      | Create transaction    |
| PUT    | /api/v1/transactions/{id} | Update transaction    |
| DELETE | /api/v1/transactions/{id} | Delete transaction    |

## How to Run

1. Start the MySQL server.
2. Configure the database connection.
3. Start Spring Boot using:

   `.\mvnw.cmd spring-boot:run`

4. Test the endpoints using Postman.

## Testing

Run automated tests using:

`.\mvnw.cmd test`

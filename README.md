# Smart Expense Tracker

A full-stack expense tracking application built with **Java 21, Spring Boot, Spring Security, JWT authentication, MySQL, and HTML/CSS/JavaScript**.

> **Demo status:** A public hosted website/API URL has not been configured yet. The instructions below run the app locally at `http://localhost:8080`. Replace the deployment placeholders in this README after hosting the application.

## Features

- User registration and login
- Password hashing with BCrypt
- JWT bearer-token authentication
- Create, list, update, and delete transactions
- Users can access only their own transactions
- Browser-based frontend served by Spring Boot
- MySQL persistence

## Technology stack

- Java 21
- Spring Boot
- Spring Security and Spring OAuth2 Resource Server
- JWT (HMAC-SHA256)
- MySQL
- Maven Wrapper
- HTML, CSS, JavaScript

## Repository

Source code: https://github.com/vikashraj2003/smart-expense-tracker

## Requirements

- Java 21
- MySQL Server
- Git (optional, if cloning the repository)
- A terminal such as PowerShell, Command Prompt, or a Unix shell

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/vikashraj2003/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Create the MySQL database and application user

Log in to MySQL as an administrator and run this SQL. Replace the example password with your own strong password.

```sql
CREATE DATABASE expense_tracker;

CREATE USER 'expense_app'@'localhost'
  IDENTIFIED BY 'CHANGE_ME_WITH_A_STRONG_PASSWORD';

GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_app'@'localhost';
FLUSH PRIVILEGES;
```

If the database or user already exists, check your existing setup rather than blindly rerunning these statements.

### 3. Configure environment variables

The app reads the database password from `DB_PASSWORD` and the JWT secret through the Spring property `app.jwt.secret`. Never commit real passwords or secrets to GitHub.

**Windows PowerShell:**

```powershell
$env:DB_PASSWORD = Read-Host "Enter the MySQL password for expense_app"

# Generate a random 256-bit JWT secret, encoded as Base64.
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Keep the same JWT secret while you want existing tokens to remain valid. Generating a new secret invalidates previously issued tokens.

### 4. Start the application

In the same PowerShell terminal where you set the variables:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--app.jwt.secret=$env:JWT_SECRET"
```

On macOS/Linux, use the Maven wrapper and pass the same Spring argument:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments="--app.jwt.secret=$JWT_SECRET"
```

If needed on macOS/Linux, make the wrapper executable with `chmod +x mvnw`.

When startup succeeds, open:

- Website: http://localhost:8080/
- Health endpoint: http://localhost:8080/api/v1/health

The website is local to your computer. Other people cannot access your `localhost` URL. A public demo requires deployment and a hosted database.

## API guide

Local base URL: `http://localhost:8080`

### Register a user

`POST /api/v1/auth/register`

Example JSON (use a unique email address):

```json
{
  "name": "Demo User",
  "email": "demo.user@example.com",
  "password": "ReplaceWithAStrongPassword123!"
}
```

The accepted fields are defined in `RegisterRequest.java`; follow that class if the request format changes.

### Log in

`POST /api/v1/auth/login`

```json
{
  "email": "demo.user@example.com",
  "password": "ReplaceWithAStrongPassword123!"
}
```

A successful login returns a JWT token. Use the returned token in your API client. Never publish or share a real token.

### Transaction endpoints

Send this header for protected transaction requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/v1/health` | Health check | Public |
| POST | `/api/v1/auth/register` | Register a user | Public |
| POST | `/api/v1/auth/login` | Log in and obtain a token | Public |
| GET | `/api/v1/transactions` | List your transactions | Bearer token |
| POST | `/api/v1/transactions` | Create a transaction | Bearer token |
| PUT | `/api/v1/transactions/{id}` | Update your transaction | Bearer token |
| DELETE | `/api/v1/transactions/{id}` | Delete your transaction | Bearer token |

Example transaction body:

```json
{
  "type": "EXPENSE",
  "amount": 250.00,
  "currency": "INR",
  "description": "Lunch",
  "transactionDate": "2026-10-19"
}
```

Use `INCOME` or `EXPENSE` for `type`. The amount must be positive, currency should be a three-letter uppercase code such as `INR`, and the date must be today or earlier.

### Test with curl

Register (adjust the JSON if your DTO changes):

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo.user@example.com","password":"ReplaceWithAStrongPassword123!"}'
```

Log in:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo.user@example.com","password":"ReplaceWithAStrongPassword123!"}'
```

Use the token from the login response:

```bash
curl http://localhost:8080/api/v1/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

You can also run the requests in Postman or another API client.

## Security notes

- Never commit real passwords, `.env` files, database credentials, JWT secrets, or bearer tokens.
- Use a unique, strong password for each test account.
- Use HTTPS and secure secret management when deploying.
- Review CORS, CSRF, allowed routes, database permissions, and production logging before exposing the app publicly.
- This README is usage documentation, not a security audit.

## Public demo / deployment

- **Website URL:** Not deployed yet — add the public URL after hosting.
- **API base URL:** Not deployed yet — add the public API URL after hosting.
- **Source code:** https://github.com/vikashraj2003/smart-expense-tracker

For deployment, host the Spring Boot app and MySQL database, configure `DB_PASSWORD` and `app.jwt.secret` securely, and test the health endpoint and authentication before sharing the URL.

## Troubleshooting

- **Database connection fails:** Ensure MySQL is running, the `expense_tracker` database exists, and `DB_PASSWORD` matches the `expense_app` user's password.
- **Missing `app.jwt.secret`:** Start the app with the documented `--app.jwt.secret` argument or configure the property securely in your hosting environment.
- **Invalid token after restart:** If the JWT secret changed, log in again to obtain a fresh token.
- **Port 8080 is in use:** Stop the other app using that port or configure another server port.
- **Maven tests fail:** Confirm Java 21 is installed and the required database environment is configured.

## License

No license is specified. Add a license file if you want to explicitly grant others permission to use, modify, and distribute this project.

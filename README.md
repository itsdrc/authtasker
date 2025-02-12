# Authtasker

// TODO: description

## Features
- Authentication based on bearer token
- Role-based access control (readonly, editor, admin)
- Secure password hashing
- Email validation for role upgrade (readonly->editor)
- Health endpoint (only admin)
- Error handling and validation
- Logging and monitoring (http and system logs)
- Unit, integration and e2e tests
- Seed data (only in development mode)
- Token blacklisting
- Input sanitization and validation
- API rate limiting to prevent abuse
- Administrator user creation when the server is started

### Users API
- Register 
- Login 
- Logout 
- Request email validation
- Confirm emai validation
- Update by id
- Delete by id
- Find find by id
- Find all using pagination (limit, page)

### Tasks API
- Create
- Update by id
- Delete by id
- Find by id
- Find all using pagination (limit, page)
- Get all tasks created by user

## Prerequisites

## Build and run

### Clone the repository
```
git clone https://github.com/itsdrc/authtasker.git
```
### Install dependencies
```
npm install
```
### Create env files
Copy the .env.template file and create the following files
- .env.dev (development)
- .env.e2e (e2e server for testing)
- .env.int: (integration tests)
- .env.prod (production)

## Testing

### unit
```
npm run test:unit
```

###  integration
This command starts the needed docker container as well
```
npm run test:int
```

### e2e
Run on different consoles
- Starts the server, it is the same application but using the .env.e2e file
    ```
    npm run server:e2e 
    ```
- Run the tests
    ```
    npm run test:e2e 
    ```


Or run both in parallel. 
Make sure to disable HTTP_LOGS env , otherwise
you will see a lot of logs being printed at the same time as the tests results
```
npm run test:e2e:parallel
```


## Usage


### Logs

## Api documentation




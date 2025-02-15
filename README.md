# Authtasker
Backend application designed to manage user authentication, authorization and task management. Built with NodeJS, Typescript and Express.  

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
- Token blacklisting using redis
- Input sanitization and validation
- API rate limiting, max request size and max request timeout to prevent abuse
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

### Run in development mode
```
npm run dev
```

### Build production
```
npm run build
```

### Run production
```
npm run start
```

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
## Logs
#### System logs
- Logs are saved in filesystem
- Three levels: info, error, warn

![Image](https://github.com/user-attachments/assets/7766983d-b9bc-4791-8709-9e6de809ddd2)

#### Http logs
- Logs are saved in filesystem
- Debug messages are disabled in production mode.
- Debug messages are not saved in filesystem
- Four levels: info, error, debug, warn
- Set HTTP_LOGS env to false to disable these logs

![Image](https://github.com/user-attachments/assets/b928b138-0481-4884-b6a2-3a7c53daff86)

## Api documentation
https://authtaskerdocs.apidog.io




// fake user expected in req.body
export const user = 'mock-user';

// successful validated user returned by validator
export const validatedUser = 'mock-validated-user';

// successful created user returned by userService.create()
export const createdUser = 'mock-created-user';

// successful created user returned by userService.login()
export const loggedUser = 'mock-logged-user';

// successful found user returned by userService.findOne()
export const userFound = 'mock-user-found';

// successful found users returned by userService.findAll()
export const usersFound = 'mock-users-found';

// fake token expected in req.params.token
export const token = '123';

// fake id expected in req.params.id
export const id = '123express';

// fake limit expected in req.query.limit
export const limit = '3';

// fake page expected in req.query.page
export const page = '5';

// fake Request object
export const request = {
    body: user,
    params: {
        token,
        id
    },
    query: {
        limit,
        page
    },
} as const;
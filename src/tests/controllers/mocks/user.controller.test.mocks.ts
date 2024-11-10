
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

// fake token expected in req.params.token
export const token = '123';

// fake id expected in req.params.id
export const id = '123express';

// fake Request object
export const request = {
    body: user,
    params: { token: token, id: id },
} as const;
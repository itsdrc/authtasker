import { MockProxy } from "jest-mock-extended";
import { Query } from "mongoose";

/* 
  Let Typescript to know that any function in "Model" that starts with "find" is a:
  - jest mock
  - function that when is called returns a Query with mocked 
  
  for example:
  model.findOne().mockResolvedValue(...) -> Ok, it is a mock
  model.findOne().exec().mockResolvedValue(...) -> Ok, it is also a mock 
*/
export type FindMockQuery<Model> = {
    [K in keyof Model]:
    K extends `find${string}` ?
    jest.MockedFunction<() => MockProxy<Query<any, any>>>
    : Model[K];
};

/*
Usage: In order to mock functions like "exec" after a find call
we are using something like this on this project: 

> userModelMock.findById.mockReturnValue(mock<Query<any, any>>());

Use this type to allow typescript to deduce its return as a mock too, for example:

> let userModelMock: FindMockQuery<UserModelMocked> & UserModelMocked;

Now, this line is totally valid for typescript: 

> userModelMock.findOne().exec.mockResolvedValue(undefined);

Otherwise we'd need to do this:

> (userModelMock.findOne().exec as any).mockResolvedValue(undefined);
*/
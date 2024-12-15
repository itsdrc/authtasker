import axios from 'axios'
import { UserRequest } from "@root/types/user/user-request.type";
import * as dataGenerator from "../../helpers/generators/user-info.generator";

describe('Users Api', () => {
    const apiPath = `${process.env.WEB_URL}/api/users/create`;

    describe('describing something..', () => {
        test('user should be created succesfully', async () => {
            const expectedStatus = 201;
            const user: UserRequest = {
                name: dataGenerator.name(),
                email: dataGenerator.name(),
                password: dataGenerator.name(),
            };

            const response = await axios.post(apiPath, user);
            expect(response.status).toBe(expectedStatus);
        });
    });
});
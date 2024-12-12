import axios from 'axios';
import { faker } from '@faker-js/faker/.';

import { UserRequest } from '@root/types/user/user-request.type';
import { USER_CONSTANTS as CONSTS } from '@root/rules/constants/user.constants';

const createUserUrl = `${process.env.WEB_URL}/api/users/create`;

describe('Users api', () => {
    describe('/POST', () => {
        
    });
});
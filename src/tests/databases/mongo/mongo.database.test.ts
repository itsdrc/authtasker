import mongoose from "mongoose";
import { MongoDatabase } from "../../../databases/mongo/mongo.database";

describe('MongoDatabase', () => {
    const mongoURI = 'my_uri';

    describe('connect', () => {
        test('connect (mongoose) should be called with mongoURI', async () => {
            const connectMock = jest.spyOn(mongoose, 'connect')
                .mockImplementation(() => ({} as any));
            await MongoDatabase.connect(mongoURI);
            expect(connectMock).toHaveBeenCalledWith(mongoURI);
        });
    });

    describe('disconnect', () => {
        test('disconnect (mongoose) should be called', async () => {
            const disconnectSpy = jest.spyOn(mongoose, 'disconnect');                
            await MongoDatabase.disconnect();
            expect(disconnectSpy).toHaveBeenCalledTimes(1);
        });
    });
});
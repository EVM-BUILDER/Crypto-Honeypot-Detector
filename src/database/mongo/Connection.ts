'use strict';

import mongoose, {ConnectOptions} from 'mongoose';

const mongoHost = '';
const mongoPort = '';
const mongoDb = '';
const dbUser = '';
const dbPass = '';

export default class MongoConnection {

    public static async connect(): Promise<void> {

        let urlMongoConnect: string;
        if (dbUser !== '') {
            urlMongoConnect = `mongodb://${dbUser}:${dbPass}@${mongoHost}:${mongoPort}/${mongoDb}`;
        } else {
            urlMongoConnect = `mongodb://${mongoHost}:${mongoPort}/${mongoDb}`;
        }
        await mongoose.connect(urlMongoConnect, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions);

    }
}

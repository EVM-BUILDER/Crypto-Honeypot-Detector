'use strict';

import mongoose, {ConnectOptions} from 'mongoose';

const mongoHost = '115.79.33.19';
const mongoPort = '27017';
const mongoDb: string = 'tin_dev';
const dbUser: string = 'monigame';
const dbPass: string = 'moni123456';

export default class MongoConnection {

    public static async connect(): Promise<void> {
        let urlMongoConnect: string;
        if (dbUser !== '') {
            urlMongoConnect = `mongodb://${dbUser}:${dbPass}@${mongoHost}:${mongoPort}/${mongoDb}?connectTimeoutMS=10000&authSource=admin`;
            // urlMongoConnect = 'mongodb://monigame:moni123456@115.79.33.19:27017/tin_dev?connectTimeoutMS=10000&authSource=admin';
        } else {
            urlMongoConnect = `mongodb://${mongoHost}:${mongoPort}/${mongoDb}`;
        }
        await mongoose.connect(urlMongoConnect, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions);
    }
}

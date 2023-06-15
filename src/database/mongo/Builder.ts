'use strict';

// @ts-ignore
import mongoose from 'mongoose';
import MongoConnection from './Connection';

export default class BuilderMongoDB {
	protected Client;
	protected schema: any;

	constructor(schema: any, tableName: string) {
		try {
			MongoConnection.connect().then();
			if (mongoose.models && mongoose.models[tableName]) {
				this.Client = mongoose.models[tableName];
			} else {
				schema.create_user = {type: String, default: null};
				schema.modifier_user = {type: String, default: null};
				schema.created = {type: Date, default: Date.now()};
				schema.modified = {type: Date, default: Date.now()};
				const schemaMongoDB = new mongoose.Schema(schema, {
					versionKey: false,
					timestamps: false,
					supressReservedKeysWarning: true
				});
				this.Client = mongoose.model(tableName, schemaMongoDB);
			}
		} catch (e: any) {
			throw e.message;
		}
		this.schema = schema;
	}

	public async find(conditions: any | undefined, fields: any = [], limit: number = 100, skip: number = 0, sort: any = {}) {
		if (typeof conditions === 'undefined') {
			conditions = {};
		}
		// .populate({path: 'test_id'})
		return await this.Client.find(conditions, fields).limit(limit).skip(skip).sort(sort);
	}

	public async findOne(conditions: any, fields: any = []) {
		if (Object.keys(conditions).length === 0) {
			return {};
		}
		return await this.Client.findOne(conditions, fields);
	}


	// Insert row and will be removed after ttl seconds
	public async insert(data: any) {
		if (Object.keys(data).length === 0) {
			throw 'Data insert is not correct';
		}
		data.created = Date.now();
		return await this.Client.create(data).then((resp: any) => resp._id);
	}

	// Update row and will be removed after ttl seconds
	public async update(id: string, data: any) {
		if (Object.keys(data).length === 0) {
			throw new Error('Data update is not correct');
		}
		delete data?._id;
		data.modified = Date.now();
		return this.Client.findByIdAndUpdate(id, data, {new: true});
	}
}

'use strict';

// @ts-ignore
import mongoose from 'mongoose';
import MongoConnection from './Connection';

export default class BuilderMongoDB {
	protected Client;
	protected schema: any;

	constructor(schema: any) {
		try {
			MongoConnection.connect().then();
			if (mongoose.models && mongoose.models[schema.table_name]) {
				this.Client = mongoose.models[schema.table_name];
			} else {
				schema.create_user = {type: String, default: null};
				schema.modifier_user = {type: String, default: null};
				schema.created = {type: Date, default: Date.now()};
				schema.modified = {type: Date, default: null};
				const schemaMongoDB = new mongoose.Schema(schema, {
					versionKey: false,
					timestamps: false,
					supressReservedKeysWarning: true
				});
				this.Client = mongoose.model(schema.table_name, schemaMongoDB);
			}
		} catch (e: any) {
			throw e.message;
		}
		this.schema = schema;
	}

	public async find(conditions: DataProps | undefined, fields: any = [], limit: number = 100, skip: number = 0, sort: any = {}) {
		if (typeof conditions !== 'undefined') {
			conditions = this.checkDataWithSchema(conditions);
		} else {
			conditions = {};
		}
		// .populate({path: 'test_id'})
		return await this.Client.find(conditions, fields).limit(limit).skip(skip).sort(sort);
	}

	public async findOne(conditions: DataProps, fields: any = []) {
		conditions = this.checkDataWithSchema(conditions);
		if (Object.keys(conditions).length === 0) {
			return {};
		}
		return await this.Client.findOne(conditions, fields);
	}


	// Insert row and will be removed after ttl seconds
	public async insert(data: DataProps) {
		data = this.checkDataWithSchema(data);
		if (Object.keys(data).length === 0) {
			throw 'Data insert is not correct';
		}
		data.created = Date.now();
		return await this.Client.create(data).then((resp: any) => resp._id);
	}

	// Update row and will be removed after ttl seconds
	public async update(id: string, data: any) {
		data = this.checkDataWithSchema(data);
		if (Object.keys(data).length === 0) {
			throw new Error('Data update is not correct');
		}
		delete data?._id;
		data.modified = Date.now();
		return this.Client.findByIdAndUpdate(id, data, {new: true});
	}

	private checkDataWithSchema(data: any) {
		for (const key of Object.keys(data)) {
			if (key === '_id') {
				continue;
			}
			if (!this.schema.fields[key]) {
				delete data[key];
			}
			if (this.schema.fields[key].type === String || this.schema.fields[key] === String) {
				BuilderMongoDB.sanitizeStringSchema(key, data);
			}

			if (this.schema.fields[key]?.type === Object || this.schema.fields[key]?.type === Array) {
				data[key] = BuilderMongoDB.sanitizeData(data[key]);
			}
		}
		return data;
	}

	private static sanitizeStringSchema(key: string, data: any) {
		if (/^\$/.test(key) || typeof data[key] === 'object') {
			delete data[key];
		}
	}

	private static sanitizeData(data: any) {
		if (data instanceof Object) {
			for (const key in data) {
				if (/^\$/.test(key)) {
					delete data[key];
				} else {
					BuilderMongoDB.sanitizeData(data[key]);
				}
			}
		}
		return data;
	}
}

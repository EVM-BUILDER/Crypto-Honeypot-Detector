'use strict';
import BuilderMongoDB from '../database/mongo/Builder';

export default class BaseModel {
	protected MongoDB: any;

	constructor(schema: any, tableName: string) {
		this.MongoDB = new BuilderMongoDB(schema, tableName);
	}

	public async find(conditions: any = {}, fields: string[] = [], limit = 20, skip = 0, sort = []) {
		return await this.MongoDB.find(conditions, fields, limit, skip, sort);
	}

	public async findOne(conditions: any = {}, fields: string[] = []) {
		return await this.MongoDB.findOne(conditions, fields);
	}

	public async insert(data: any) {
		return await this.MongoDB.insert(data);
	}

	public async update(id: string, data: any) {
		return await this.MongoDB.update(id, data);
	}

	public async delete(id: string) {
		return await this.MongoDB.delete(id);
	}
}

'use strict';
import {Request} from 'express';

export interface IRequest extends Request {
	session?: any;
	authorization?: any;
}

export type ValidateRule = {
	[key: string]: string
};

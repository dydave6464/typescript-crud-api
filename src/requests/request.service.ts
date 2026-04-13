// src/requests/request.service.ts
import { db } from '../_helpers/db';
import { RequestModel, RequestCreationAttributes } from './request.model';

export const requestService = {
    getAll,
    getByAccountId,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll(): Promise<RequestModel[]> {
    return await db.Request.findAll();
}

async function getByAccountId(accountId: number): Promise<RequestModel[]> {
    return await db.Request.findAll({ where: { accountId } });
}

async function getById(id: number): Promise<RequestModel> {
    return await getRequest(id);
}

async function create(params: RequestCreationAttributes): Promise<RequestModel> {
    return await db.Request.create(params);
}

async function update(id: number, params: Partial<RequestCreationAttributes>): Promise<void> {
    const request = await getRequest(id);
    await request.update(params);
}

async function _delete(id: number): Promise<void> {
    const request = await getRequest(id);
    await request.destroy();
}

async function getRequest(id: number): Promise<RequestModel> {
    const request = await db.Request.findByPk(id);
    if (!request) {
        throw new Error('Request not found');
    }
    return request;
}

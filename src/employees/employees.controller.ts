// src/employees/employees.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { employeeService } from './employee.service';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

export default router;

function getAll(req: Request, res: Response, next: NextFunction): void {
    employeeService.getAll()
        .then((employees) => res.json(employees))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    employeeService.getById(Number(req.params.id))
        .then((employee) => res.json(employee))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    employeeService.create(req.body)
        .then((employee) => res.json(employee))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    employeeService.update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'Employee updated' }))
        .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    employeeService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'Employee deleted' }))
        .catch(next);
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        employeeId: Joi.string().required(),
        userId: Joi.number().required(),
        position: Joi.string().required(),
        departmentId: Joi.number().required(),
        hireDate: Joi.date().required(),
    });
    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        employeeId: Joi.string().empty(''),
        userId: Joi.number(),
        position: Joi.string().empty(''),
        departmentId: Joi.number(),
        hireDate: Joi.date(),
    });
    validateRequest(req, next, schema);
}

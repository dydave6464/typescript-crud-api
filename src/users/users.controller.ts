// src/users/users.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { Role } from '../_helpers/role';
import { validateRequest } from '../_middleware/validateRequest';
import { userService } from './user.service';

const router = Router();

// AUTH ROUTES (must come before /:id to avoid conflict)
router.post('/register', registerSchema, register);
router.post('/verify-email', verifyEmailSchema, verifyEmail);
router.post('/authenticate', authenticateSchema, authenticate);

// CRUD ROUTES
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

export default router;

// ROUTE HANDLERS
function getAll(req: Request, res: Response, next: NextFunction): void {
    userService.getAll()
        .then((users) => res.json(users))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    userService.getById(Number(req.params.id))
        .then((user) => res.json(user))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    userService.create(req.body)
        .then((user) => res.json(user))
        .catch(next);
}

function update(req: Request, res: Response, next: NextFunction): void {
    userService.update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'User updated' }))
        .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    userService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'User deleted' }))
        .catch(next);
}

function register(req: Request, res: Response, next: NextFunction): void {
    userService.register(req.body)
        .then(() => res.json({ message: 'Registration successful! Please verify your email.' }))
        .catch(next);
}

function verifyEmail(req: Request, res: Response, next: NextFunction): void {
    userService.verifyEmail(req.body.email)
        .then(() => res.json({ message: 'Email verified! You can now login.' }))
        .catch(next);
}

function authenticate(req: Request, res: Response, next: NextFunction): void {
    userService.authenticate(req.body)
        .then((user) => res.json(user))
        .catch(next);
}

// VALIDATION SCHEMAS
function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        title: Joi.string().allow('', null),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        role: Joi.string().valid(Role.Admin, Role.User).default(Role.User),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        verified: Joi.boolean().default(true),
    });
    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        title: Joi.string().allow('', null),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        role: Joi.string().valid(Role.Admin, Role.User).empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        verified: Joi.boolean(),
    });
    validateRequest(req, next, schema);
}

function registerSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    });
    validateRequest(req, next, schema);
}

function verifyEmailSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });
    validateRequest(req, next, schema);
}

function authenticateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

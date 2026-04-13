// src/users/user.service.ts
import bcrypt from 'bcryptjs';
import { db } from '../_helpers/db';
import { Role } from '../_helpers/role';
import { User, UserCreationAttributes } from './user.model';

export const userService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    register,
    verifyEmail,
    authenticate,
};

async function getAll(): Promise<User[]> {
    return await db.User.findAll();
}

async function getById(id: number): Promise<User> {
    return await getUser(id);
}

async function create(params: UserCreationAttributes & { password: string }): Promise<User> {
    const existingUser = await db.User.findOne({ where: { email: params.email } });
    if (existingUser) {
        throw new Error(`Email "${params.email}" is already registered`);
    }

    const passwordHash = await bcrypt.hash(params.password, 10);

    const created = await db.User.create({
        ...params,
        passwordHash,
        role: params.role || Role.User,
        verified: params.verified ?? true,
    } as UserCreationAttributes);

    // Return without passwordHash
    return await db.User.findByPk(created.id);
}

async function update(
    id: number,
    params: Partial<UserCreationAttributes> & { password?: string }
): Promise<void> {
    const user = await getUser(id);

    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
        delete params.password;
    }

    await user.update(params as Partial<UserCreationAttributes>);
}

async function _delete(id: number): Promise<void> {
    const user = await getUser(id);
    await user.destroy();
}

// AUTH FUNCTIONS

async function register(params: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}): Promise<void> {
    const existingUser = await db.User.findOne({ where: { email: params.email } });
    if (existingUser) {
        throw new Error(`Email "${params.email}" is already registered`);
    }

    const passwordHash = await bcrypt.hash(params.password, 10);

    await db.User.create({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        passwordHash,
        role: Role.User,
        verified: false,
    } as UserCreationAttributes);
}

async function verifyEmail(email: string): Promise<void> {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Account not found');
    }
    await user.update({ verified: true });
}

async function authenticate(params: { email: string; password: string }): Promise<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    verified: boolean;
    token: string;
}> {
    const user = await db.User.scope('withHash').findOne({ where: { email: params.email } });

    if (!user) {
        throw new Error('Account not found. Please register first.');
    }

    if (!user.verified) {
        throw new Error('Please verify your email first.');
    }

    const passwordMatch = await bcrypt.compare(params.password, user.passwordHash);
    if (!passwordMatch) {
        throw new Error('Incorrect password.');
    }

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        verified: user.verified,
        token: user.email, // simple token matching Lab 2 behavior
    };
}

async function getUser(id: number): Promise<User> {
    const user = await db.User.scope('withHash').findByPk(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
}

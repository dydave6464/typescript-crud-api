// src/_helpers/seed.ts
import bcrypt from 'bcryptjs';
import { db } from './db';
import { Role } from './role';

export async function seedDefaults(): Promise<void> {
    // Default admin
    const adminEmail = 'admin@example.com';
    const existingAdmin = await db.User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
        await db.User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            passwordHash: await bcrypt.hash('Password123!', 10),
            role: Role.Admin,
            verified: true,
        });
        console.log(`Seeded default admin: ${adminEmail} / Password123!`);
    }

    // Default departments
    const defaultDepartments = [
        { name: 'Engineering', description: 'Software development team' },
        { name: 'HR', description: 'Human resources department' },
    ];
    for (const dept of defaultDepartments) {
        const existing = await db.Department.findOne({ where: { name: dept.name } });
        if (!existing) {
            await db.Department.create(dept);
            console.log(`Seeded department: ${dept.name}`);
        }
    }
}

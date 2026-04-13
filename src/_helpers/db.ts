// src/_helpers/db.ts
import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

export interface Database {
    User: any;
    Department: any;
    Employee: any;
    Request: any;
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

    // Create database if it doesn't exist
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // Connect to database with Sequelize
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql', logging: false });

    // Initialize models
    const { default: userModel } = await import('../users/user.model');
    const { default: departmentModel } = await import('../departments/department.model');
    const { default: employeeModel } = await import('../employees/employee.model');
    const { default: requestModel } = await import('../requests/request.model');

    db.User = userModel(sequelize);
    db.Department = departmentModel(sequelize);
    db.Employee = employeeModel(sequelize);
    db.Request = requestModel(sequelize);

    // Associations
    db.User.hasOne(db.Employee, { foreignKey: 'userId', onDelete: 'CASCADE' });
    db.Employee.belongsTo(db.User, { foreignKey: 'userId' });

    db.Department.hasMany(db.Employee, { foreignKey: 'departmentId' });
    db.Employee.belongsTo(db.Department, { foreignKey: 'departmentId' });

    db.User.hasMany(db.Request, { foreignKey: 'accountId', onDelete: 'CASCADE' });
    db.Request.belongsTo(db.User, { foreignKey: 'accountId' });

    // Sync models with database
    await sequelize.sync({ alter: true });

    // Seed default data
    const { seedDefaults } = await import('./seed');
    await seedDefaults();

    console.log('Database initialized and models synced');
}

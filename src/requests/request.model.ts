// src/requests/request.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import type { Sequelize } from 'sequelize';

export interface RequestItem {
    name: string;
    quantity: number;
}

export interface RequestAttributes {
    id: number;
    type: string;
    items: RequestItem[];
    status: string;
    date: string;
    accountId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface RequestCreationAttributes
    extends Optional<RequestAttributes, 'id' | 'status' | 'date' | 'createdAt' | 'updatedAt'> {}

export class RequestModel
    extends Model<RequestAttributes, RequestCreationAttributes>
    implements RequestAttributes {

    public id!: number;
    public type!: string;
    public items!: RequestItem[];
    public status!: string;
    public date!: string;
    public accountId!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof RequestModel {
    RequestModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            items: {
                type: DataTypes.JSON,
                allowNull: false,
                defaultValue: [],
            },
            status: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'Pending',
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            accountId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            sequelize,
            modelName: 'Request',
            tableName: 'requests',
            timestamps: true,
        }
    );

    return RequestModel;
}

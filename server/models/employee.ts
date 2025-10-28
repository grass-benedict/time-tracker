import { DataTypes, Model } from 'sequelize';
import { sequelize } from './sync.ts';

class Employee extends Model {
  public id!: number;
  public name!: string;
  public surname!: string;
  public username!: string;
  public password!: string;
  public vacationDays!: number;
  public flexAccount!: number;
  public role!: string;

  //timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vacationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    flexAccount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize, //pass sequelize instance
    tableName: 'employees',
    modelName: 'Employee',
    timestamps: true,
  }
);

export default Employee;
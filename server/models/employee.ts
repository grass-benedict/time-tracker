import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database.ts';

// Interface tells typescript what columns a database table has
interface EmployeeAttributes{
  id: number;
  name: string;
  surname: string;
  username: string;
  password: string;
  vacationDays: number;
  flexAccount: number;
  role: 'employee' | 'manager' | 'hr' | 'admin' | null;
  flexMonthly: number | null;
  vacationDaysUsed: number;
  vacationDaysPending: number;
  hoursMonthly: number;
  hoursWorked: number;
  department: string;
  managerId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type EmployeeCreationAttributes = Optional <
  EmployeeAttributes,
  'id' | 'managerId' | 'flexMonthly' | 'role' | 'vacationDaysPending' | 'createdAt' | 'updatedAt'
>

class Employee extends Model <EmployeeAttributes, EmployeeCreationAttributes> implements EmployeeAttributes{
  declare id: number;
  declare name: string;
  declare surname: string;
  declare username: string;
  declare password: string;
  declare vacationDays: number;
  declare flexAccount: number;
  declare role: 'employee' | 'manager' | 'hr' | 'admin' | null;
  declare flexMonthly: number | null;
  declare vacationDaysUsed: number;
  declare vacationDaysPending: number;
  declare hoursMonthly: number;
  declare hoursWorked: number;
  declare department: string;
  declare managerId: number | null;

  //timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vacationDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 25,
    },
    flexAccount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    role: {
      type: DataTypes.ENUM('employee', 'manager', 'hr', 'admin'),
      allowNull: true,
      defaultValue: 'employee',
    },
    flexMonthly: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    vacationDaysUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    vacationDaysPending: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    hoursMonthly: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 160, // full-time hours
    },
    hoursWorked: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    department: {
    type: DataTypes.ENUM('Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Executive'),
    allowNull: false,
    defaultValue: 'Engineering',
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'employees', key: 'id' },
      onDelete: 'SET NULL',
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
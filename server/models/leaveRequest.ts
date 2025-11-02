import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database.ts';

interface LeaveRequestAttributes {
  id: number;
  employeeId: number;
  type: 'vacation' | 'sick';
  startDate: Date;
  endDate: Date;
  approvedBy?: number | null;
  approvedStatus: 'pending' | 'approved' | 'denied';
  note?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type LeaveRequestCreationAttributes = Optional<
  LeaveRequestAttributes,
  'id' | 'approvedBy' | 'approvedStatus' | 'note' | 'createdAt' | 'updatedAt'
>;

class LeaveRequest extends Model< LeaveRequestAttributes, LeaveRequestCreationAttributes > implements LeaveRequestAttributes
{
  declare id: number;
  declare employeeId: number;
  declare type: 'vacation' | 'sick';
  declare startDate: Date;
  declare endDate: Date;
  declare approvedBy?: number | null;
  declare approvedStatus: 'pending' | 'approved' | 'denied';
  declare note?: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

LeaveRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'employees', key: 'id' },
    },
    type: {
      type: DataTypes.ENUM('vacation', 'sick'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'employees', key: 'id' },
    },
    approvedStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'denied'),
      allowNull: false,
      defaultValue: 'pending',
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize, //pass sequelize instance
    tableName: 'leave_requests',
    modelName: 'LeaveRequest',
    timestamps: true,
  }
);

export default LeaveRequest;
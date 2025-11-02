import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../config/database.ts';

interface TimeLogAttributes {
  id: number;
  employeeId: number;
  clockTime: Date;
  eventType: 'IN' | 'OUT'; // enforce valid values
  createdAt?: Date;
  updatedAt?: Date;
}

type TimeLogCreationAttributes = Optional<TimeLogAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class TimeLog extends Model<TimeLogAttributes, TimeLogCreationAttributes> {
  declare id: number;
  declare employeeId: number;
  declare clockTime: Date;
  declare eventType: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TimeLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    clockTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.ENUM('IN', 'OUT'),
      allowNull: false,
    },
  },
  
  {
    sequelize, //pass sequelize instance
    tableName: 'time_logs',
    modelName: 'TimeLog',
    timestamps: true,
  }
);

export default TimeLog;
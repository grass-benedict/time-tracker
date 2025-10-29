import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.ts';

class TimeLog extends Model {
  public id!: number;
  public employeeId!: number;
  public clockTime!: Date; //timestamp
  public eventType!: string;

  //timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TimeLog.init(
  {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'employees', //reference the employee table (one to many db relationship). employeeId is a foreignKey
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
        type: DataTypes.STRING,
        allowNull: false,
    },
  },
  
  {
    sequelize, //pass sequelize instance
    tableName: 'timeLogs',
    modelName: 'TimeLog',
    timestamps: true,
  }
);

export default TimeLog;
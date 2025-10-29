import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.ts';

class StatusLog extends Model {
    public id!: number;
    public employeeId!: number;
    public statusType!: string;
    public startDate!: Date;
    public endDate!: Date;
    public notes!: string;
  //timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StatusLog.init(
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
    statusType:{
        type: DataTypes.STRING,
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
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  },
  
  {
    sequelize, //pass sequelize instance
    tableName: 'statusLogs',
    modelName: 'StatusLog',
    timestamps: true,
  }
);

export default StatusLog;
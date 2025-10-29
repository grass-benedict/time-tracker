import sequelize from "../config/database.ts";
import Employee from "./employee.ts";
import TimeLog from "./timeLog.ts";
import StatusLog from "./statusLog.ts";

// Associations
Employee.hasMany(TimeLog, {
    foreignKey: 'employeeId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Employee.hasMany(StatusLog,{
    foreignKey: 'employeeId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

TimeLog.belongsTo(Employee, {
    foreignKey: 'employeeId',
});

StatusLog.belongsTo(Employee, {
    foreignKey: 'employeeId'
});

const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("All models synced successfully");
    } catch (err){
        console.error("Error syncing models:", err);
    }
};

export { sequelize, Employee, TimeLog, StatusLog ,syncModels };
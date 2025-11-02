import sequelize from "../config/database.ts";
import Employee from "./employee.ts";
import TimeLog from "./timeLog.ts";
import LeaveRequest from "./leaveRequest.ts";

// EMPLOYEE -> EMPLOYEE (manager relationship)
Employee.hasMany(Employee,{
    as:'subordinates',
    foreignKey: 'managerId'
});
Employee.belongsTo(Employee, {
    as: 'manager',
    foreignKey: 'managerId',
});

// EMPLOYEE -> TIME LOG


const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("All models synced successfully");
    } catch (err){
        console.error("Error syncing models:", err);
    }
};

export { sequelize, Employee, TimeLog, LeaveRequest ,syncModels };
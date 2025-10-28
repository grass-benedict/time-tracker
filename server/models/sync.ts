import sequelize from "../config/database.ts";
import Employee from "./employee.ts";

const syncModels = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("All models synced successfully");
    } catch (err){
        console.error("Error syncing models:", err);
    }
};

export { sequelize, Employee, syncModels };
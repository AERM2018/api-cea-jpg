const User = require('../models/user');
const Employee = require('../models/employee');
const Time_tables = require('../models/time_tables');




const getAllEmployees = async (req, res) => {
    const employees = await Employee.findAll();

    return res.status(200).json({
        employees
    })
}

const createEmployee = async (req, res) => {
    const { body } = req;
    const { user_type, email, password } = body;
    const { day, start_hour, finish_hour } = body;
    const {name, surname, rfc, curp, mobile_number, active }=body;
    let id_user,id_employee,id_time_table
    try { 
        const user = new User({user_type,email,password});
        const newUser=await user.save()
        const userJson = newUser.toJSON();
        id_user = userJson['id_user']
        console.log(id_user)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    try {
        const time_table= new Time_tables({day,start_hour,finish_hour})
        const newTimeTable = await time_table.save();
        const newTimeTableJson=newTimeTable.toJSON(); 
        id_time_table = newTimeTableJson[id_time_table]
    } catch (error) {
        
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    
    try {
        const employee = new Employee({id_user,name, surname, rfc, curp, mobile_number, email, active });
        const newEmployee = await employee.save();
        const newEmployeeJson=newEmployee.toJSON();
        id_employee=newEmployeeJson[id_employee]
    } catch (error) {
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }

    try {
        const emp_tim = new Emp_tim({id_employee,id_time_table});
        await emp_tim.save();
    } catch (error) {
        
    }

    res.status(201).json({
        msg: "empleado creado correctamente"
    })

   


}
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const employee = await Employee.findByPk(id);
        if(!employee){
            return res.status(404).json({
                msg: "No existe un empleado con el id "+id,
            });
        }
        
        await employee.update(body);
        res.json( employee )
    
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
 
        const employee = await Employee.findByPk(id);
        if(!employee){
            return res.status(404).json({
                msg: "No existe un empleado con el id "+id,
            });
        }
        
        await employee.destroy(body);
        res.json(employee)
    

}






module.exports = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
}
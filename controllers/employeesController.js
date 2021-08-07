const User = require('../models/user');
const Employee = require('../models/employee');
const Time_tables = require('../models/time_tables');
const Emp_dep = require('../models/emp_dep');
const Emp_tim = require('../models/emp_tim');
const bcrypt = require('bcryptjs');
const Cam_use = require('../models/cam_use');
const Department = require('../models/department');
const { db } = require('../database/connection');
const { getEmployees } = require('../queries/queries');
const { QueryTypes, Op } = require('sequelize');
const generateMatricula = require('../helpers/generateMatricula');
const getAllEmployees = async (req, res) => {
    try {
        const employees_no_time = await db.query(getEmployees, { type : QueryTypes.SELECT})
        
    
        const employees_time = employees_no_time.map( async employee => {
            const emp_time =  await Emp_tim.findAll({
                where : {id_employee : employee.id_employee},
                attributes : ['id_time_table']
            })
    
            const time_tables = await Time_tables.findAll({
                where : { id_time_table : { [Op.in] : emp_time.map(time_table => time_table.toJSON().id_time_table)}},
                attributes : { exclude : ['id_time_table']}
            })
    
            return {...employee, time_table : time_tables.map( time_table => time_table.toJSON())}
        })
    
    
        Promise.all(employees_time).then( employees => {
            return res.status(200).json({
                ok: true,
                employees,
            })
        })
        
    } catch ( err ) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg : "Hable con el administrador",
        })
    }
}

const createEmployee = async (req, res) => {
    const { body } = req;
    const {  email } = body;
    const { time_tables, id_campus  } = body;
    const { name, surname_f,surname_m, rfc, curp, mobile_number, id_department, salary} = body;
    let id_user, id_employee, user
    let ids_emp_tim

    try {
        const employee= await Employee.findOne({
            where:{rfc}
        })
        if(employee){
            return res.status(400).json({
                ok : false,
                msg: "Ya existe un empleado con ese rfc",
            })
        }
        const employee2= await Department.findOne({
            where:{id_department}
        })
        if(!employee2){
            return res.status(400).json({
                ok : false,
                msg: `El departamento con el id ${id_department} no existe`,
            })
        }

        const employee3 = await Employee.findOne({
            where:{curp}
        })
        if(employee3){
            return res.status(400).json({
                ok : false,
                msg: "Ya existe un empleado con ese curp",
            })
        }
            const usern = new User({user_type:"employee",email,password:"123456"});
            const newUser=await usern.save()
            const userJson = newUser.toJSON();
            id_user = userJson['id_user']
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {

        ids_emp_tim = time_tables.map(async (x) => {
            let { day, start_hour, finish_hour } = x;
            const time = await Time_tables.findAll({
                where: { 'day': day, 'start_hour': start_hour, 'finish_hour': finish_hour }
            });
            if (time.length < 1) {
                const time_table = new Time_tables({ day, start_hour, finish_hour })
                const newTime_Table = await time_table.save();
                const newTime_tableJson = newTime_Table.toJSON();
                id_time_table = newTime_tableJson['id_time_table']
                return id_time_table;
            } else {
                return time[0].id_time_table
            }

        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }

    try {
        //creation of id_employee
        id_employee = generateMatricula(id_user)
        //creating employee
        const employee = new Employee({ id_employee, id_user, name, surname_f,surname_m, rfc, curp, mobile_number,salary });
        const newEmployee = await employee.save();
        const newEmployeeJson = newEmployee.toJSON();
        id_employee = newEmployeeJson['id_employee']
        user = await User.findByPk(id_user);
        // creation of password
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(id_employee, salt)

        await user.update({ password: pass });

        const inst_email = `${id_employee}@alejandria.edu.mx`
        await user.update({email : inst_email})

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }

    try {

        const emp_dep = new Emp_dep({id_employee, id_department})
        await emp_dep.save()
    } catch ( err ) {
        console.log(err)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {

        ids_emp_tim.forEach(async (x) => {
            id_time_table = await x
            const emp_tim = new Emp_tim({ id_employee, id_time_table });
            await emp_tim.save();

        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }
    try {
       //campus
        
        const cam_use = new Cam_use({id_campus,id_user});
        await cam_use.save();


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador",
        })
    }


    res.status(201).json({
        ok: true,
        msg: `Empleado creado correctamente con id: ${id_employee}`
        
    })

}
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un empleado con el id " + id,
            });
        }

        await employee.update(body);


        res.status(200).json({
            ok: true,
            msg: "El empleado se actualizo correctamente",

        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }
}
const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const {active}=req.body;
    try {
        
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un empleado con el id " + id,
            });
        }
        if (employee.active===2 || employee.active===3) {
            return res.status(404).json({
                ok: false,
                msg: "No existe un empleado con el id " + id,
            });
        }

        await employee.update({ active })
    
        res.status(200).json({
            ok: true,
            msg: "El empleado se elimino correctamente",
    
        })
    } catch ( error ) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            msg: "Hable con el administrador"
        })
    }


}

module.exports = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
}
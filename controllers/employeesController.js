const User = require('../models/user');
const Employee = require('../models/employee');
const Time_tables = require('../models/time_tables');
const Emp_tim = require('../models/emp_tim');
const { createJWT } = require("../helpers/jwt");
const bcrypt = require('bcryptjs');

const getAllEmployees = async (req, res) => {
    const employees = await Employee.findAll({
        where: { 'active': 1 }
    });
    let token;
    if (req.revaToken) {
        const { id_user, user_type, id_role } = req
        token = await createJWT(id_user, user_type, id_role)
    }

    return res.status(200).json({
        ok: true,
        employees,
        token
    })
}

const createEmployee = async (req, res) => {
    const { body } = req;
    const { user_type, email } = body;
    const { day, start_hour, finish_hour } = body;
    const { name, surname, rfc, curp, mobile_number, active } = body;
    let id_user, id_employee, id_time_table
    try {
        const user = new User({ user_type, email, password: "12345678" });
        const newUser = await user.save()
        const userJson = newUser.toJSON();
        id_user = userJson['id_user']
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    try {
        const time_table = new Time_tables({ day, start_hour, finish_hour })
        const newTimeTable = await time_table.save();
        const newTimeTableJson = newTimeTable.toJSON();
        id_time_table = newTimeTableJson['id_time_table']
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }

    try {
        //creation of id_employee
        const name1 = name.split(" ")
        const name2 = surname.split(" ")
        id_employee = `ale${id_user}.${name1[0]}.${name2[0]}`
        //creating employee
        const employee = new Employee({ id_employee, id_user, name, surname, rfc, curp, mobile_number, active });
        const newEmployee = await employee.save();
        const newEmployeeJson = newEmployee.toJSON();
        id_employee = newEmployeeJson['id_employee']
        const user = await User.findByPk(id_user);
        // creation of password
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(id_employee, salt)

        await user.update({ password: pass });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }

    try {
        const emp_tim = new Emp_tim({ id_employee, id_time_table });
        await emp_tim.save();
    } catch (error) {
        console.log(error)
    }

    res.status(201).json({
        ok: true,
        msg: "empleado creado correctamente"
    })




}
const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({
                msg: "No existe un empleado con el id " + id,
            });
        }

        await employee.update(body);

        let token;
        if (req.revaToken) {
            const { id_user, user_type, id_role } = req
            token = await createJWT(id_user, user_type, id_role)
        }
        res.status(200).json({
            ok: true,
            msg: "El empleado se actualizo correctamente",
            token
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador"
        })
    }
}
const deleteEmployee = async (req, res) => {
    const { id } = req.params;


    const employee = await Employee.findByPk(id);
    if (!employee) {
        return res.status(404).json({
            msg: "No existe un empleado con el id " + id,
        });
    }

    await employee.update({ active: 0 })
    let token;
    if (req.revaToken) {
        const { id_user, user_type, id_role } = req
        token = await createJWT(id_user, user_type, id_role)
    }

    res.status(200).json({
        ok: true,
        msg: "El trabajador se elimino correctamente",
        token
    })


}






module.exports = {
    getAllEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
}
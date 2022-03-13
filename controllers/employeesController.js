const User = require("../models/user");
const Employee = require("../models/employee");
const Time_tables = require("../models/time_tables");
const Emp_dep = require("../models/emp_dep");
const Emp_tim = require("../models/emp_tim");
const bcrypt = require("bcryptjs");
const Cam_use = require("../models/cam_use");
const Department = require("../models/department");
const { db } = require("../database/connection");
const { getEmployees } = require("../queries/queries");
const { QueryTypes, Op, fn, col, literal } = require("sequelize");
const { generateIdAle } = require("../helpers/generateIdOrMatricula");
const {
  getEmployeesInfoWithTimeTable,
} = require("../helpers/getDataSavedFromEntities");
const { printAndSendError } = require("../helpers/responsesOfReq");
const getAllEmployees = async (req, res) => {
  try {
    let employees = await getEmployeesInfoWithTimeTable();
    employees = employees.filter((employee) => employee.active === 1);
    return res.status(200).json({
      ok: true,
      employees,
    });
  } catch (err) {
    printAndSendError(res, err);
  }
};

const createEmployee = async (req, res) => {
  const { body } = req;
  const { email } = body;
  const { time_table, id_campus } = body;
  const {
    name,
    surname_f,
    surname_m,
    rfc,
    curp,
    mobile_number,
    id_department,
    salary,
  } = body;
  let id_user, id_employee, user;
  let ids_emp_tim;

  try {
    const employee = await Employee.findOne({
      where: { rfc },
    });
    if (employee) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un empleado con ese rfc",
      });
    }
    const employee2 = await Department.findOne({
      where: { id_department },
    });
    if (!employee2) {
      return res.status(400).json({
        ok: false,
        msg: `El departamento con el id ${id_department} no existe`,
      });
    }

    const employee3 = await Employee.findOne({
      where: { curp },
    });
    if (employee3) {
      return res.status(400).json({
        ok: false,
        msg: "Ya existe un empleado con ese curp",
      });
    }
    const usern = new User({
      user_type: "employee",
      email,
      password: "123456",
    });
    const newUser = await usern.save();
    const userJson = newUser.toJSON();
    id_user = userJson["id_user"];
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
  try {
    ids_emp_tim = time_table.map(async (x) => {
      let { day, start_hour, finish_hour } = x;
      const time = await Time_tables.findAll({
        where: { day: day, start_hour: start_hour, finish_hour: finish_hour },
      });
      if (time.length < 1) {
        const time_table = new Time_tables({ day, start_hour, finish_hour });
        const newTime_Table = await time_table.save();
        const newTime_tableJson = newTime_Table.toJSON();
        id_time_table = newTime_tableJson["id_time_table"];
        return id_time_table;
      } else {
        return time[0].id_time_table;
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }

  try {
    //creation of id_employee
    id_employee = generateIdAle(id_user);
    //creating employee
    const employee = await Employee.create({
      id_employee,
      id_user,
      name,
      surname_f,
      surname_m,
      rfc,
      curp,
      mobile_number,
      salary,
    });
    user = await User.findByPk(id_user);
    // creation of password
    const salt = bcrypt.genSaltSync();
    const pass = bcrypt.hashSync(id_employee, salt);

    await user.update({ password: pass });

    const inst_email = `${id_employee}@alejandria.edu.mx`;
    await user.update({ email: inst_email });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Hable con el administrador",
    });
  }

  try {
    const emp_dep = new Emp_dep({ id_employee, id_department });
    await emp_dep.save();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
  try {
    ids_emp_tim.forEach(async (x) => {
      id_time_table = await x;
      const emp_tim = new Emp_tim({ id_employee, id_time_table });
      await emp_tim.save();
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
  try {
    //campus

    const cam_use = new Cam_use({ id_campus, id_user });
    await cam_use.save();
    const result = await getEmployeesInfoWithTimeTable(id_employee);
    res.status(201).json({
      ok: true,
      msg: `Empleado creado correctamente con id: ${id_employee}`,
      result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

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
    const employeeRfcConcidence = await Employee.findOne({
      where: {
        [Op.and]: [{ rfc: body.rfc }, { id_employee: { [Op.ne]: id } }],
      },
    });
    if (employeeRfcConcidence) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe un empleado con el RFC ${body.rfc}`,
      });
    }

    const employeeCurpConcidence = await Employee.findOne({
      where: {
        [Op.and]: [{ curp: body.curp }, { id_employee: { [Op.ne]: id } }],
      },
    });
    if (employeeCurpConcidence) {
      return res.status(400).json({
        ok: false,
        msg: `Ya existe un empleado con la CURP ${body.curp}`,
      });
    }
    // Actualizar campus del usuario
    const campusUser = await Cam_use.findOne({
      where: { id_user: employee.id_user },
    });
    if (campusUser.id_campus !== body.id_campus) {
      campusUser.update({ id_campus: body.id_campus });
    }
    // Actualizar departamento del trabajador
    const employeeDepartment = await Emp_dep.findOne({
      where: { id_employee: id },
    });
    if (employeeDepartment.id_department !== body.id_department) {
      employeeDepartment.update({ id_department: body.id_department });
    }
    // Actualizar el horario del trabajador
    const employeeTimeTable = await Time_tables.findAll({
      where: {
        id_time_table: {
          [Op.in]: literal(
            `(SELECT id_time_table FROM emp_tim WHERE id_employee = '${id}')`
          ),
        },
      },
      nest: false,
      raw: true,
    });
    await Promise.all(
      body.time_table.map(async (req_time_table) => {
        const current_time_table = employeeTimeTable.find(
          (time_table) => time_table.day === req_time_table.day
        );
        if (current_time_table) {
          if (
            current_time_table.start_hour === req_time_table.start_hour &&
            current_time_table.start_hour == req_time_table.start_hour
          )
            return;
          await Emp_tim.destroy({
            where: {
              id_time_table: current_time_table.id_time_table,
              id_employee: id,
            },
          });
        }

        const possible_time_table = await Time_tables.findOne({
          where: {
            day: req_time_table.day,
            start_hour: req_time_table.start_hour,
            finish_hour: req_time_table.finish_hour,
          },
        });
        if (possible_time_table) {
          await Emp_tim.create({
            id_employee: id,
            id_time_table: possible_time_table.id_time_table,
          });
        } else {
          const { id_time_table } = await Time_tables.create({
            day: req_time_table.day,
            start_hour: req_time_table.start_hour,
            finish_hour: req_time_table.finish_hour,
          });
          await Emp_tim.create({
            id_employee: id,
            id_time_table,
          });
        }
      }),
      employeeTimeTable.map(async (time_table_db) => {
        const time_table_days = body.time_table.map(
          (time_table) => time_table.day
        );
        if (!time_table_days.includes(time_table_db.day)) {
          await Emp_tim.destroy({
            where: {
              id_time_table: time_table_db.id_time_table,
              id_employee: id,
            },
          });
        }
      })
    );

    await employee.update(body);

    res.status(200).json({
      ok: true,
      msg: "El empleado se actualizo correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un empleado con el id " + id,
      });
    }
    if (employee.active === 2 || employee.active === 3) {
      return res.status(404).json({
        ok: false,
        msg: "No existe un empleado con el id " + id,
      });
    }

    await employee.update({ active });

    res.status(200).json({
      ok: true,
      msg: "El empleado se elimino correctamente",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

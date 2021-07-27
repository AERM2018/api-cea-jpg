const { fn, col } = require("sequelize");
const Teacher = require("../models/teacher");
const Employees = require("../models/employee");
const Student = require("../models/student");

const getLogInInfo = async( id_user, user_type ) => {
    let userEntityInfo;
    switch (user_type) {
        case 'teacher':
            userEntityInfo = await Teacher.findByPk(id_user,{attributes : ['id_teacher',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name']]})
            break;
        case 'employee':
            userEntityInfo = await Employees.findOne(_user,{attributes : ['id_employee',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name']]})
        break;
        case 'student':
            userEntityInfo = await Student.findOne({where:{matricula:id_user},attributes : ['id_student',[fn('concat',col('name')," ",col('surname_f')," ",col('surname_m')),'name']]})
            break
        default:
            return {}
    }
    return userEntityInfo.toJSON()
}


module.exports = {
    getLogInInfo
}

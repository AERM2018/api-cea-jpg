const User = require('../models/user');
const Teacher = require('../models/teacher');
const Cou_tea = require('../models/cou_tea');





const getAllTeachers = async (req, res) => {
    const teachers = await Teacher.findAll({
        where:{'active':1}
    });

    return res.status(200).json({
        ok:true,
        teachers
    })
}

const createTeacher = async (req, res) => {
    const { body } = req;
    const { user_type, email } = body;
    const { id_courses, status, start_date ,end_date } = body;
    const {name, surname, rfc, mobile_number, id_ext_cou, courses, active }=body;
    let id_user,id_teacher
    try { 
        const user = new User({user_type,email,password:"123456"});
        const newUser=await user.save()
        const userJson = newUser.toJSON();
        id_user = userJson['id_user']
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    try {
        const teacher = new Teacher({id_user,name, surname, rfc, mobile_number, id_ext_cou, courses, active});
        const newTeacher = await teacher.save();
        const newTeacherJson=newTeacher.toJSON();
        id_teacher=newTeacherJson['id_teacher']
        // create password
        const user = await User.findByPk(id_user);
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(id_teacher,salt)
        
        await user.update({password:pass});
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    try {
        id_courses.forEach(async id_course => {
            const cou_tea= new Cou_tea({id_course, id_teacher, status, start_date ,end_date})
            await cou_tea.save();
        });
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }

    res.status(201).json({
        msg: "Maestro creado correctamente"
    })

   


}
const updateTeacher = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const teacher = await Teacher.findByPk(id);
        if(!teacher){
            return res.status(404).json({
                msg: "No existe un maestro con el id "+id,
            });
        }
        
        await teacher.update(body);
        res.status(200).json({
            ok:true,
            msg:"El maestro se actualizo correctamente"
        })
    
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const deleteTeacher = async (req, res) => {
    const { id } = req.params;
        const teacher = await Teacher.findByPk(id);
        if(!teacher){
            return res.status(404).json({
                msg: "No existe un empleado con el id "+id,
            });
        }
        
        await teacher.update({active:0})
        res.status(200).json({
            ok:true,
            msg:"El maestro se elimino correctamente"
        })
    

}






module.exports = {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
}
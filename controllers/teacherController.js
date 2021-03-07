const User = require('../models/user');
const Teacher = require('../models/teacher');
const Cou_tea = require('../models/cou_tea');




const getAllTeachers = async (req, res) => {
    const teachers = await Teacher.findAll();

    return res.status(200).json({
        teachers
    })
}

const createTeacher = async (req, res) => {
    const { body } = req;
    const { user_type, email, password } = body;
    const { id_courses, status, start_date ,end_date } = body;
    const {name, surname, rfc, curp, mobile_number, id_ext_cou, courses, active }=body;
    let id_user,id_teacher
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
        const teacher = new Teacher({id_user,name, surname, rfc, mobile_number, id_ext_cou, courses, active});
        const newTeacher = await teacher.save();
        const newTeacherJson=newTeacher.toJSON();
        id_teacher=newTeacherJson[id_teacher]
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }
    try {
        console.log(id_courses)
        id_courses.forEach(async id_course => {
            const cou_tea= new Cou_tea({id_course, id_teacher:1, status, start_date ,end_date})
            await cou_tea.save();
            console.log(id_course+" creado")
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
                msg: "No existe un empleado con el id "+id,
            });
        }
        
        await teacher.update(body);
        res.json( teacher )
    
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const deleteTeacher = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
 
        const teacher = await Teacher.findByPk(id);
        if(!teacher){
            return res.status(404).json({
                msg: "No existe un empleado con el id "+id,
            });
        }
        
        await teacher.destroy(body);
        res.json(employee)
    

}






module.exports = {
    getAllTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher
}
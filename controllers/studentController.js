const User = require('../models/user');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const Group = require('../models/group');
const Stu_gro = require ('../models/stu_gro');
const Cam_use =require('../models/cam_use');

const getAllStudents = async (req, res) => {
    const students = await Student.findAll({
        where:{'status':2}
    });

    return res.status(200).json({
        ok:true,
        students
    })
}

const createStudent = async (req, res) => {
    const { body } = req;
    const { user_type, email } = body;
    const {id_group, id_campus} = body;
    const {id_student,name, surname, group_chief, curp, status, mobile_number, mobile_back_number,address,start_date,end_date,complete_documents }=body;
    let id_user
    try { 
        const user = new User({user_type,email,password:"123456"});
        const newUser=await user.save()
        const userJson = newUser.toJSON();
        id_user = userJson['id_user']
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok : false,
            msg: "Hable con el administrador",
        })
    }  
    try {
        //matricula
        const student = new Student({id_student,id_user,name, surname, group_chief, curp,status, mobile_number,mobile_back_number,address,start_date,end_date,complete_documents });
        await student.save();
        // password
        const user = await User.findByPk(id_user);
        const salt = bcrypt.genSaltSync();
        const pass = bcrypt.hashSync(id_student,salt)
        await user.update({password:pass});
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok : false,
            msg: "Hable con el administrador",
        })
    }
    try {
        const group = await Group.findByPk(id_group);
        if (!group) {
            return res.status(404).json({
                ok: false,
                msg: "No existe una grupo con el id " + id_major,
            });
        }
        const stu_gro= new Stu_gro({id_student,id_group})
        await stu_gro.save();

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok : false,
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
        ok:true,
        msg: "estudiante creado correctamente"
    })

   

}
const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    try {
        const student = await Student.findByPk(id);
        if(!student){
            return res.status(404).json({
                ok : false,
                msg: "No existe un estudiante con el id "+id,
            });
        }
        
        await student.update(body);
        res.status(200).json({
            ok:true,
            msg:"El estudiante se actualizo correctamente"
        })
    
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok : false,
            msg : "Hable con el administrador"
        })
    }
}

const deleteStudent = async (req, res) => {
    const { id } = req.params;
 
        const student = await Student.findByPk(id);
        if(!student){
            return res.status(404).json({
                ok : false,
                msg: "No existe un alumno con el id "+id,
            });
        }
        
        await student.update({status:2})
        res.status(200).json({
            ok:true,
            msg:"El alumno se elimino correctamente"
        })
    

}






module.exports = {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
}
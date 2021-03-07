const User = require('../models/user');
const Student = require('../models/student');





const getAllStudents = async (req, res) => {
    const students = await Student.findAll();

    return res.status(200).json({
        students
    })
}

const createStudent = async (req, res) => {
    const { body } = req;
    const { user_type, email, password } = body;
    const {name, surname, group_chief, curp,status, mobile_number,mobile_back_number,address,start_date,end_date,complete_documents }=body;
    let id_user
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
        const student = new Student({id_user,name, surname, group_chief, curp,status, mobile_number,mobile_back_number,address,start_date,end_date,complete_documents });
        await student.save();
        
    } catch (error) {
        return res.status(500).json({
            msg: "Hable con el administrador",
        })
    }

    res.status(201).json({
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
                msg: "No existe un empleado con el id "+id,
            });
        }
        
        await student.update(body);
        res.json( student )
    
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg : "Hable con el administrador"
        })
    }
}
const deleteStudent = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
 
        const student = await Student.findByPk(id);
        if(!student){
            return res.status(404).json({
                msg: "No existe un empleado con el id "+id,
            });
        }
        
        await student.destroy(body);
        res.json(student)
    

}






module.exports = {
    getAllStudents,
    createStudent,
    updateStudent,
    deleteStudent
}
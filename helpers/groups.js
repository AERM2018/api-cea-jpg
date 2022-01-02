const { literal, fn, col, Op, where } = require("sequelize");
const Campus = require("../models/campus");
const Cam_gro = require("../models/cam_gro");
const Cam_use = require("../models/cam_use");
const Course = require("../models/courses");
const Cou_tea = require("../models/cou_tea");
const Educational_level = require("../models/educational_level");
const Group = require("../models/group");
const Gro_cou = require("../models/gro_cou");
const Major = require("../models/major");
const Student = require("../models/student");
const Stu_gro = require("../models/stu_gro");
const Teacher = require("../models/teacher");
const User = require("../models/user")

const getGroupInfo = async(id_group = 0) => {
    Cam_gro.belongsTo(Group,{foreignKey:'id_group'})
    Group.hasOne(Cam_gro,{foreignKey:'id_group'})
    Cam_gro.belongsTo(Campus,{foreignKey:'id_campus'})
    Campus.hasOne(Cam_gro,{foreignKey:'id_campus'})   
    Group.belongsTo(Major,{foreignKey:'id_major'})
    Major.hasOne(Group,{foreignKey:'id_major'})
    Major.belongsTo(Educational_level,{foreignKey:'id_edu_lev'})
    Educational_level.hasOne(Major,{foreignKey:'id_edu_lev'})
    let groups = await Group.findAll({
        attributes : {include : [['name_group','group_name']],exclude:['name_group']},
        include : [{
            model : Cam_gro,
            include : {model :Campus,attributes:['campus_name']}
        },
        {
            model : Major, attributes : [[fn('concat',col('major.educational_level.educational_level'),' en ',col('major_name')),'major_name']],
            include : { model : Educational_level, attributes : []}
        }],
        where : {...(id_group)&&{id_group}}
    })
    groups = groups.map((group)=>{
        let {major,cam_gro:{campus},...restGroupInfo} = group.toJSON()
        return {...campus,...major,...restGroupInfo,}
    })
    return (id_group) ? groups[0] : groups
}

const getTitularTeacherOfCourse = async(id_group = 0, id_course = 0) =>{
    // Gro_cou.belongsTo(Course,{foreignKey:'id_course'})
    // Course.hasOne(Gro_cou,{foreignKey:'id_course'})
    // Cou_tea.belongsTo(Course,{foreignKey:'id_course'})
    // Course.hasOne(Cou_tea,{foreignKey:'id_course'})
    Cou_tea.belongsTo(Teacher,{foreignKey:'id_teacher'})
    Teacher.hasOne(Cou_tea,{foreignKey:'id_teacher'})
    const course = await Cou_tea.findOne({
        // where : {[Op.and] : [{id_course},{id_group}]},
        
            include : {
                model:Teacher,
                attributes : ['id_teacher',[fn('concat',col('name'),' ',col('surname_f'),' ',col('surname_m')),'teacher_name']]
            },
            where : where(literal(`((${col('start_date').col} = (SELECT start_date FROM gro_cou WHERE id_course = ${id_course} AND id_group = ${id_group})) AND (${col('end_date').col} = (SELECT end_date FROM gro_cou WHERE id_course = ${id_course} AND id_group = ${id_group})) AND ${col('id_course').col} = ${id_course})`),true),
        raw : true,
        nest : true
    })
    return course
}
module.exports = {
    getGroupInfo,
    getTitularTeacherOfCourse
};

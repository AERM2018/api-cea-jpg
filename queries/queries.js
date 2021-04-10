const queries = {
    'getCourses' : 'SELECT cou.id_course, maj.major_name, cou.course_name FROM courses cou LEFT JOIN majors maj ON cou.id_major = maj.id_major',
    'getScholarships' : 'SELECT sch.*, sch_stu.id_student, CONCAT(stu.name," ",stu.surname_f," ",stu.surname_m) AS "student" FROM scholarships sch LEFT JOIN sch_stu ON sch.id_scholarship = sch_stu.id_scholarship LEFT JOIN students stu ON stu.id_student = sch_stu.id_student',
    'getUserById' : 'SELECT u.id_user, u.user_type, u.password, u.email , ru.id_role FROM users u LEFT JOIN rol_use ru ON u.id_user = ru.id_user WHERE u.id_user IN (SELECT id_user FROM students WHERE matricula = :id) or u.id_user IN (SELECT id_user FROM teachers WHERE id_teacher = :id) or u.id_user IN (SELECT id_user FROM employees WHERE id_employee = :id)',
    'getGrades' : 'SELECT cou.id_course, cou.course_name , stu.id_student ,CONCAT(stu.name," ",stu.surname_f," ",stu.surname_m) AS "student_full_name", gra.grade FROM grades gra LEFT JOIN courses cou ON gra.id_course = cou.id_course LEFT JOIN students stu ON gra.id_student = stu.id_student WHERE gra.id_course = :id_course AND gra.id_student in (SELECT stu_gro.id_student FROM stu_gro WHERE id_group = :id_group)',
    'getTeachers' : 'SELECT tea.*, cam.campus_name FROM cam_use LEFT JOIN campus cam ON cam.id_campus = cam_use.id_campus LEFT JOIN teachers tea ON tea.id_user = cam_use.id_user WHERE active = 1',
    'getStudents' : 'SELECT stu.*, cam.campus_name FROM cam_use LEFT JOIN campus cam ON cam.id_campus = cam_use.id_campus LEFT JOIN students stu ON stu.id_user = cam_use.id_user WHERE status = 1',
    'getEmployees' : 'SELECT emp.*, cam.campus_name , dep.department_name FROM cam_use LEFT JOIN campus cam ON cam.id_campus = cam_use.id_campus LEFT JOIN employees emp ON emp.id_user = cam_use.id_user LEFT JOIN emp_dep ON emp.id_employee = emp_dep.id_employee LEFT JOIN departments dep ON dep.id_department = emp_dep.id_department WHERE active = 1',
    'getGroups' : 'SELECT gro.* , maj.major_name FROM groupss gro LEFT JOIN majors maj ON gro.id_major = maj.id_major',
    "getReqPay" : 'SELECT * FROM req_pay WHERE id_payment = :id',
    "getStuInfo" : "SELECT id_student, matricula, CONCAT(name,' ',surname_f,' ',surname_m) as student_fullname, name_group, id_group, campus_name, major_name FROM stu_info WHERE id_student = :id"
}

module.exports = queries
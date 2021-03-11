const queries = {
    'getCourses' : '`SELECT cou.id_course, maj.major_name, cou.course_name FROM courses cou LEFT JOIN majors maj ON cou.id_major = maj.id_major`',
    'getScholarships' : 'SELECT sch.*, sch_stu.id_student, CONCAT(stu.name,stu.surname) AS "Student" FROM scholarships sch LEFT JOIN sch_stu ON sch.id_scholarship = sch_stu.id_scholarship LEFT JOIN students stu ON stu.id_student = sch_stu.id_student',
    'getUserById' : 'SELECT u.id_user, u.user_type, u.password, ru.id_role FROM users u LEFT JOIN rol_use ru ON u.id_user = ru.id_user WHERE u.id_user IN (SELECT id_user FROM students WHERE id_student = :id) or (SELECT id_user FROM teachers WHERE id_teacher = :id) or (SELECT id_user FROM employees WHERE id_employee = :id) ',
    'getGrades' : 'SELECT cou.course_name , CONCAT(stu.name,stu.surname," ") AS "student.name", gra.grade FROM grades gra LEFT JOIN courses cou ON gra.id_course = cou.id_course LEFT JOIN students stu ON gra.id_student = stu.id_student WHERE gra.id_course = :id_course AND gra.id_student in (SELECT stu_gro.id_student FROM stu_gro WHERE id_group = :id_group)'
}

module.exports = queries
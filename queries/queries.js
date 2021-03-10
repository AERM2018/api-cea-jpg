const queries = {
    'getScholarships' : 'SELECT sch.*, sch_stu.id_student, CONCAT(stu.name,stu.surname) AS "Student" FROM scholarships sch LEFT JOIN sch_stu ON sch.id_scholarship = sch_stu.id_scholarship LEFT JOIN students stu ON stu.id_student = sch_stu.id_student',
    'getUserById' : 'SELECT u.id_user, u.user_type, ru.id_role FROM users u LEFT JOIN rol_use ru ON u.id_user = ru.id_user WHERE u.id_user IN (SELECT id_user FROM students WHERE id_student = :id) or (SELECT id_user FROM teachers WHERE id_teacher = :id) or (SELECT id_user FROM employees WHERE id_employee = :id) '
}

module.exports = queries
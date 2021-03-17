

## Majors

### Get all the majors

```
URL/majors /*Method http: GET*/
```

_This endpoint returns all the careers_

_An example_
```
{
    "ok": true,
    "majors": [
        {
            "id_major": 1,
            "major_name": "matematicas"
        }
    ]
}
```

### Modify a major

```
URL/majors/Id_major   /*Method http: PUT*/
```

- _This endpoint you must send an object so as to modify a major if you send something wrong it won't create anything_
- _In the part of the parameter put the id of the major instead of id-major_
- _The next object is an example to know how to send it_

```
        {
                 "major_name":"name of the major"   
        }
```



### Create a major

```
/api-wp/v1/majors    /*Method http: POST*/
```


- _This endpoint you must send an object so as to create a major if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
        {
                 "major_name":"name of the major"   
        }
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "Major creado correctamente"
}
```

### Delete major

```
/api-wp/v1/majors/id_major  /*Method http: DELETE*/
```
- _This endpoint is to delete a major, you just have to put in the params the id of the major instead of id-major_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "La materia se elimino correctamente"
}
```


## Departments

### Get All Departments

```
URL/departments /*Method http: GET*/
```

_This endpoint returns all the departments_

_An example_
```
{
    "ok": true,
    "departments": [
        {
            "id_department": 1,
            "department_name": "name of the department"
        }
    ]
}
```
### Create a department

```
/api-wp/v1/departments    /*Method http: POST*/
```


- _This endpoint you must send an object so as to create a department if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
        {
                 "department_name":"name of the department"   
        }
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "department creado correctamente"
}
```

### Modify a department

```
URL/departments/Id_deparment   /*Method http: PUT*/
```

- _This endpoint you must send an object so as to modify a deparment if you send something wrong it won't create anything_
- _In the part of the parameter put the id of the department instead of id-department_
- _The next object is an example to know how to send it_

```
        {
                 "department_name":"name of the department"   
        }
```


### Delete department

```
URL/departments/Id_deparment  /*Method http: DELETE*/
```
- _This endpoint is to delete a department, you just have to put in the params the id of the department instead of id-department_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El departamento se elimino correctamente"
}
```

## Groups

### Get All groups

```
URL/groups /*Method http: GET*/
```

_This endpoint returns all the groups_

_An example_
```
{
    "ok": true,
    "groups": [
        {
            "id_group": 1,
            "id_major": 2,
            "name_group": "gro",
            "entry_year": "1000-01-01",
            "end_year": "2000-01-01"
        }
    ]
}
```

### Create a group

```
/api-wp/v1/groups    /*Method http: POST*/
```


- _This endpoint you must send an object so as to create a group if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
       {
    "id_major": 1,
    "name_group": "gro",
    "entry_year": "1000-01-01",
    "end_year": "2000-01-01",
    "time_tables": [
        {
            "day": 7,
            "start_hour": "1:00:00",
            "finish_hour": "2:00:00"
        },
        {
            "day": 1,
            "start_hour": "1:00:00",
            "finish_hour": "2:00:00"
        },
        {
            "day": 5,
            "start_hour": "12:15:04",
            "finish_hour": "1:15:04"
        }
    ]
}
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "Grupo creado correctamente"
}
```
### Modify a group

```
URL/groups/Id_group   /*Method http: PUT*/
```

- _This endpoint you must send an object so as to modify a group if you send something wrong it won't create anything_
- _In the part of the parameter put the id of the group instead of id-group_
- _The next object is an example to know how to send it_

```
      {
    "id_major": 2,
    "name_group": "4c",
    "entry_year": "1000-01-01",
    "end_year": "2000-01-01"
   
}
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El grupo se actualizo correctamente"
}
```

### Delete group

```
URL/groups/Id_group   /*Method http: DELETE*/
```
- _This endpoint is to delete a group, you just have to put in the params the id of the group instead of id-group_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El departamento se elimino correctamente"
}
```
## Employees

### Get All Employees

```
URL/employees /*Method http: GET*/
```

_This endpoint returns all the employees_

_An example_
```
{
    "ok": true,
    "employees": [
        {
            "id_employee": "ale1.johan.gonzalez",
            "id_user": 1,
            "name": "johan",
            "surname": "gonzalez",
            "rfc": "dwadwada23",
            "curp": "afrfowsef",
            "mobile_number": "61825930",
            "active": 1
        }]
}
```
### Create an employee

```
/api-wp/v1/employees    /*Method http: POST*/
```


- _This endpoint you must send an object so as to create a employee if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
   {
    "user_type": "flamas",
    "email": "email@gmail.com",
    "name": "nombre",
    "surname": "apellido",
    "curp": "curp",
    "mobile_number": "6182593051",
    "mobile_back_number": "4223",
    "address": "domicilio",
    "active": 1,
    "rfc": "rfc",
    "id_campus":1,
   "time_tables" : [{
    "day":7,
    "start_hour": "1:00:00",
    "finish_hour": "2:00:00"
    },{
    "day":1,
    "start_hour": "1:00:00",
   "finish_hour": "2:00:00"
                        },{
    "day":5,
    "start_hour": "12:15:04",
    "finish_hour": "1:15:04"
    }]
    
}
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "Empleado creado correctamente"
}
```
### Modify a employee

```
URL/employees/Id_employee   /*Method http: PUT*/
```

- _This endpoint you must send an object so as to modify a employee if you send something wrong it won't create anything_
- _In the part of the parameter put the id of the employee instead of id-employee_
- _The next object is an example to know how to send it_

```
      {
    "name": "nombre",
    "surname": "apellido",
    "curp": "curp",
    "mobile_number": "6182593051",
    "mobile_back_number": "4223",
    "address": "domicilio",
    "active": 1,
    "rfc": "rfc"
   
}
```



- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El empleado se actualizo correctamente"
}
```
### Delete employee

```
URL/employees/Id_employee   /*Method http: DELETE*/
```
- _This endpoint is to delete a employee, you just have to put in the params the id of the employee instead of id-employee_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El empleado se elimino correctamente"
}
```
## Students

### Get All students

```
URL/students /*Method http: GET*/
```

_This endpoint returns all the students_

_An example_
```
{
    "ok": true,
    "students": []
}
```
### Create a student

```
/api-wp/v1/students    /*Method http: POST*/
```


- _This endpoint you must send an object so as to create a student if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
  {

    "user_type": "student",
    "email": "email1111@gmail.com",
    "id_student": "amatricula",
    "name": "1na1me",
    "surname": "s1ur1name",
    "id_group": 1,
    "id_campus":1,
    "group_chief": 0,
    "curp": "cu1d1rp",
    "status": 1,
    "mobile_number": "6611825",
    "mobile_back_number": "4164020",
    "address": "address",
    "start_date": "1000-01-01",
    "end_date": "2000-01-01",
    "complete_documents":0
    
    
}
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "estudiante creado correctamente"
}
```
### Modify a student

```
URL/students/Id_students   /*Method http: PUT*/
```

- _This endpoint you must send an object so as to modify a student if you send something wrong it won't create anything_
- _In the part of the parameter put the id of the student instead of id-student_
- _The next object is an example to know how to send it_

```
{
 "name": "1na1me",
    "surname": "s1ur1name",
    "id_group": 1,
    "id_campus":1,
    "group_chief": 0,
    "curp": "cu1d1rp",
    "status": "sta1atus",
    "mobile_number": "6611825",
    "mobile_back_number": "4164020",
    "address": "address",
    "start_date": "1000-01-01",
    "end_date": "2000-01-01",
    "complete_documents":0
    }
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El estudiante se actualizo correctamente"
}
```
### Delete student

```
URL/students/Id_students   /*Method http: DELETE*/
```
- _This endpoint is to delete a student, you just have to put in the params the id of the student instead of id-student_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El estudiante se elimino correctamente"
}
```
## Teachers

### Get All Teachers

```
URL/teachers /*Method http: GET*/
```

_This endpoint returns all the students_

_An example_
```
{
    "ok": true,
    "teachers": []
}
```
### Create a teacher

```
/api-wp/v1/teachers    /*Method http: POST*/
```


- _This endpoint you must send an object so as to create a teacher if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
  {
    "user_type": "teacher",
    "email": "emmail1234@gmail.com",
    "name": "1na11me",
    "surname": "s1u1r1name",
    "id_campus":1,
    "id_ext_cou": null,
    "curp": "cu1d111r1p",
    "rfc": "rf1c121",
    "active": 1,
    "mobile_number": "6611125",
    "address": "address",
    "courses":2,
    "id_courses": [1,2],
    "status": "chido",
    "start_date":"1000-01-01",
     "end_date": "2000-01-01"
            
    
}
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "Maestro creado correctamente"
}
```
### Modify a teacher

```
URL/teachers/Id_teacher   /*Method http: PUT*/
```

- _This endpoint you must send an object so as to modify a teacher if you send something wrong it won't create anything_
- _In the part of the parameter put the id of the teacher instead of id-teacher_
- _The next object is an example to know how to send it_

```
{
    "name": "1na11me",
    "surname": "s1u1r1name",
    "id_ext_cou": null,
    "curp": "cu1d111r1p",
    "rfc": "rf1c121",
    "active": 1,
    "mobile_number": "6611125",
    "address": "address",
    "courses":2,
    "id_courses": [1,2],
    "status": "chido",
}
```



- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El maestro se actualizo correctamente"
}
```
### Delete teacher

```
URL/teachers/Id_teacher   /*Method http: DELETE*/
```
- _This endpoint is to delete a teacher, you just have to put in the params the id of the teacher instead of id-teacher_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El maestro se elimino correctamente"
}
```









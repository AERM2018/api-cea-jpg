# API CEA

## Welcome to the API for the Control escolar "Alejandria".

#### The first thing is to get access to the URL which help you to start requesting data.
[BASE_URL]:URL: http://api.alejandria.edu.mx/api-ale/v1/

**Note:** Don't forget that you need a token to get the data, otherwise you won't be able to get it.

## Token and how to put in the headers

The token have to be in the request's headers, add a property called "x-token" to the headers object and there put your token.

In every request you'll have to add something like this:
```
fetch(URL, {
    method : 'GET',
    headers : {
        'x-token': 'Put here your token'
    },
    body : body
    ...
})

or

const myHeaders = new Headers();

myHeaders.append('x-token', 'Put here your token');

fetch(URL, {
    method : 'GET',
    headers : myHeaders,
     body : body
    ...
})
```

**Note:** The only endpoint that don't need token is the login



## Error handeling

The endpoints may respond an error due to several reasons. The errros may be display different info, the following examples are how they will look like:

*1)* When the request is being proccesding, but the request cannot be fullfilled due to the action that is requested cannot be performed or there is a problem with the database the request's answer looks like this:
```
{
    ok : false,
    msg : "Something went wrong, try again"
}
```
This kind of error most of the time has an code error *404* or *500*

*2)* When the request is sent, but the request does not have the right attributes or the attributes' validation failed the request's answer looks like this:
```
{
    "ok": false,
    "msg": "Ocurrio un error al procesar tu petición",
    "errors": {
        "edu_level": {
            "msg": "El nivel de eduación es obligatorio",
            "param": "edu_level",
            "location": "body"
        }
    }
}
```
All the errors will be in the object "errors" . Each attribute of the object will be the name of the attribute that failed, its value will be the info about it.
This kind of error most of the time has an code error *400*


------------------------------------------------------------------------------

## Roles list
```
| Rol id  | Type             |
|       1 | admin            |
|       2 | administrativo_c |
|       3 | administrativo_r |
|       4 | administrativo_u |
|       5 | administrativo_d |
|       6 | contraloria_c    |
|       7 | contraloria_r    |
|       8 | contraloria_u    |
|       9 | contraloria_d    |
|      10 | recepcion_c      |
|      11 | recepcion_r      |
|      12 | recepcion_u      |
|      13 | recepcion_d      |
|      14 | directivos       |
```
----------------------------------------------------------------------------
# Endpints


## Authentication

### **Login**

This endpoint will authenticate the user on the server, in case the authentication has done successfully, the endpoint will return de token needed to do any of the endpoints. 

```
Endpoint:  URL/auth/login   HTTP method: POST
```


**You need to send an object like this in the request's body:**
```
{
    "id" : STRING,
    "password" : STRING
}
```

**The result will look like this:**
```
{
    "ok": true,
    "token": your token,
    "id_user": 1,
    "email": "admin@alejandria.edu.mx",
    "user_type": "admin",
    "id_role": [1],
    "user": {}
}
```
The attribute "user" on the body's response will contain more data about it such as id corresponding to the type of user and name. It looks like this:

```
"user": {
        "id_student": "ale107805",
        "name": "Rafudo fudo Fudo Fudo"
    }
```
### Change password not knowing the previous one

This action consists of 3 steps.
1. Send code for restart password to user's email
```
    URL/auth/forgotPassword  HTTP method: POST
```

**You need to send an onject like this in the request's body:**
```
        {
            email : STRING
        }
```

**The request's response would be**
```
    {
        ok : true
    }
```

**In case the email doesn't exists, the response would be**
```
    {
        "ok": false,
        "msg": "No existe un usuario con email reana_461@hotmail.com"
    }
```

2. Verify code  
Once the user has gotten the code and put it in the textfield, it's needed to verify it so as to go to the third step

```
    URL/auth/forgotPassword/verify  HTTP method: POST
```

**The request's reponse would be:**
```
{
    "ok": true,
    "url": "http://localhost:3005/api-ale/v1/auth/resetPassword/108/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c2VyIjoxMDgsImVtYWlsIjoicmV0YW5hXzQ2MUBob3RtYWlsLmNvbSIsImlhdCI6MTY0MDY0NzIzOCwiZXhwIjoxNjQwNjQ3NTM4fQ.iAUzF37TO0lXJc0SF9Xno2LSDUlr-udWCLUm38Fk33w"
}
```

**In case there will be a problem with the code, the response would be**
```
{
    "ok": false,
    "msg": "Código de recuperación de contraseña no encontrado."
}
```
3. Reset password  
For restarting the password it's needed to send a resquest to the url provided by the endpoint of verifying the code

**You need to send an onject like this in the request's body:**
```
        {
            newPassword : STRING
        }
```
**The request's reponse would be:**
```
{
    "ok": true,
    "msg": "La contraseña ha sido cambiada correctamente."
}
```
### Change password knowing the previous one
This endpoint will change a user's password when the previous password is known. You need to send the id user and the user's token in the url.

```
    URL/auth/resetPassword/id_user/token  HTTP method: POST
```
* Put the value of user id instead of "id_user" and the user's token insted of token.

**You need to send an onject like this in the request's body:**
```
        {
            oldPassword : STRING
            newPassword : STRING
        }
```

**The request's response would be**
```
{
    "ok": true,
    "msg": "La contraseña ha sido cambiada correctamente."
}
```
**In case the previous password is wrong, the response would be**

```
    {
        ok : false,
        msg : 'La contraseña anterior es incorrecta, verifiquela por favor.'
    }
```

-------------------------------------------------------------------------------------

## Majors

### Get all the majors

This endpoint will return all the careers registed.

```
URL/majors /*HTTP method: GET*/ 
```

**The result will look like:**
```
{
    "ok": true,
    "majors": [
        {
            "id_major": 1,
            "id_edu_lev": 1
            "major_name": "Matématicas",
        }
    ]
}
```

**If there're no majors, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "majors": []
    }
```

### Create a major

This endpoint will create a new major
```
URL/majors   /*HTTP method: POST*/
```

**You need to send an onject like this in the request's body:**
```
        {
                 "major_name":STRING,
                 "edu_level":NUMBER,
        }
```
_This is the value that "edu_level" could take:_  
1 : Licenciatura  

2 : Maestría 

**if the request is successful, the response will be like this:**
```
{
    "ok": true,
    "msg": "Major creado correctamente"
}
```

### Modify a major

This endpoint will update a existing major, send the major id in the url.

```
URL/majors/id_major   /*HTTP method: PUT*/
```

* Put the value of major id instead of "id_major".

**You need to send an object like this in the request's body:**

```
        {
                 "major_name":STRING,
                 "edu_level":NUMBER,
                 "active": BOOLEAN
        }
```


**if the request is successful, the response will be like this:**
```
{
    "ok": true,
    "msg": "La carrera se actualizo correctamente"
}
```

### Delete major

This endpoint will delete a major, you need to send the major id in the url

```
/api-wp/v1/majors/id_major  /*HTTP method: DELETE*/

```
* Put the value of major id instead of "id_major"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "La carrera se elimino correctamente"
}
```


## Departments

### Get All Departments

This endpoint will return all the departments that exist.

```
URL/departments /*HTTP method: GET*/
```

**If the request is successful, the response would be:**
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

**If there're no departments, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "departments": []
    }
```

### Create a department

This endpoint will create a new deparment.

```
URL/departments    /*HTTP method: POST*/
```


**You need to send an object like this in the request's body:**
```
        {
            "department_name":STRING  
        }
```


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El departamento se creo correctamente"
}
```

### Modify a department

This endpoint will update an existing department. You need send the department id in the url.

```
URL/departments/id_deparment   /*HTTP method: PUT*/
```

* Put the value of department id instead of "id_deparment"

**You need to send an object like this in the request's body:**

```
        {
                 "department_name":STRING   
        }
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El departamento se actualizo correctamente"
}
```

### Delete department

This endpoint will delete an existing department. You need to send the department id in the url.

```
URL/departments/id_deparment  /*HTTP method: DELETE*/
```

**It's not neccesary to send a body in the request**


**If the request is successful, the response would be:**

```
{
    "ok": true,
    "msg": "El departamento se elimino correctamente"
}
```
------------------------------------------------------------
## Groups

### Get All groups

This endpoint will return a list of all the groups

```
URL/groups         /*HTTP method: GET*/
```
Query params you can use:
- time_table : specify if you want to return the time table of each group. (1 or 0)


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "groups": [
        {
            "campus_name": "El mejor campus de todos 2.0",
            "major_name": "Licenciatura en Johan",
            "id_group": 5,
            "id_major": 14,
            "entry_year": '2017-01-01',
            "end_year": '2020-03-01',
            "group_name": "ASDFASDFA"
            "time_table": [
                {
                    "day": 0,
                    "start_hour": "09:00:00",
                    "finish_hour": "19:00:00"
                }
            ]
        },...
    ]
}
```

**If there're no groups, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "groups": []
    }
```


### Create a group

This endpoint will create a new group.

```
URL/groups    /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
       {
    "id_major": NUMBER,
    "name_group": STRING,
    "time_tables": [
        {
            "day": INT,
            "start_hour": STRING,
            "finish_hour": STRING
        },
        {
            "day": NUMBER,
            "start_hour": STRING,
            "finish_hour": STRING
        },
        {
            "day": NUMBER,
            "start_hour": STRING,
            "finish_hour": STRING
        }
    ]
}
```
**Important**

- The day's value is from 0 to 6. It represents the days from Sunday(0) to Saturday(6).
- The hour must be in 24hrs format in order to avoid some problems with the date validation.  




_if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "Grupo creado correctamente"
}
```


### Modify a group

This endpoint will update an existing group. You need to pass the group id in the url.

```
URL/groups/id_group   /*HTTP method: PUT*/
```

* Put the value of group id instead of "id_group"

**You need to send an object like this in the request's body:**
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

This endpoint will delete an existing group. You need to pass the group id in the url.

```
URL/groups/id_group   /*HTTP method: DELETE*/
```

* Put the value of group id instead of "id_group"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El grupo se elimino correctamente"
}
```

### Get students from a group

This endpoint will return the list of students who belong to a group. You need to send the group id in the url.

```
URL/groups/:id_group/students   /*HTTP method: GET*/
```

* Put the value of group id instead of "id_group"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "students": [
        {
            "id_stu_gro": 6,
            "id_student": "ale105083",
            "id_group": 5,
            "matricula": "DEDG202103003",
            "student_name": "Angel Gonzalez Gonzalez",
            "name_group": "3 derecho"
        },
        {
            "id_stu_gro": 7,
            "id_student": "ale106009",
            "id_group": 5,
            "matricula": "DEDG202103001",
            "student_name": "Angel Gonzalez Vergas",
            "name_group": "3 derecho"
        },
        {
            "id_stu_gro": 8,
            "id_student": "ale109946",
            "id_group": 5,
            "matricula": "DEDG202103009",
            "student_name": "Daniel Gonzalez Perez",
            "name_group": "3 derecho"
        }
    ]
}
```


**If there're no students who belong to the group, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "students": []
    }
```

## Get courses a group has taken

This endpoint will return the list of courses which a group has taken. You need to send the group id in the url.

```
URL/groups/:id_group/courses     /*HTTP method: GET*/
```

* Put the value of group id instead of "id_group"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
 "ok": true,
    "group": {
        "campus_name": "Alejandria 2",
        "major_name": "Licenciatura en Johan",
        "id_group": 6,
        "id_major": 14,
        "entry_year": '2018-06-01',
        "end_year": '2021-08-01',
        "group_name": "Rafael Beltran",
        "coursesTaken": [
            {
                "id_course": 6,
                "id_major": 13,
                "course_name": "Español avanzado 2.0",
                "clave": "",
                "credits": 0,
                "id_teacher": "ale109188",
                "teacher_name": "Rafael Beltran Retana"
            }
        ]
    }
}
```


**If there're no courses taken by the group, the request's propiety 'coursesTaken' will be an empty array []. It looks like this:**
```
    {
        ok : true
        "group": {
        "campus_name": "Alejandria 2",
        "major_name": "Licenciatura en Johan",
        "id_group": 6,
        "id_major": 14,
        "entry_year": '2018-06-01',
        "end_year": '2021-08-01',
        "group_name": "Rafael Beltran",
        "coursesTaken": []
    }
    }
```
------------------------------------------------------------
## Employees

### Get All Employees

This endpoint will return a list of all the employees.

[URL][BASE_URL] /employees    /*HTTP method: GET*/

**If the request is successful, the response would be:**
```
{
"ok": true,
    "employees": [
        {
            "id_employee": "ale104691",
            "id_user": 104,
            "name": "Angel",
            "rfc": "rfcuxsnaio113",
            "curp": "cuarpniscox121",
            "mobile_number": "6182593051",
            "active": 1,
            "salary": 5000,
            "surname_f": "Cruz",
            "surname_m": "Cruz",
            "campus_name": "El mejor campus de todos 2.0",
            "department_name": "Administrativo",
            "time_table": [
                {
                    "day": 3,
                    "start_hour": "13:00:00",
                    "finish_hour": "14:00:00"
                },
                {
                    "day": 1,
                    "start_hour": "13:00:00",
                    "finish_hour": "14:00:00"
                },
                {
                    "day": 5,
                    "start_hour": "12:15:04",
                    "finish_hour": "13:15:04"
                }
            ]
        }
    ]
}
```

**If there're no employees, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "employees": []
    }

```
### Create an employee

This endpoint will create a new employee

```
URL/employees    /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
   {
    "email": STRING,
    "name": STRING,
    "surname_f": STRING,
    "surname_m": STRING,
    "curp": STRING,
    "mobile_number": STRING,
    "rfc": STRING,
    "id_campus":NUMBER,
    "id_department":NUMBER,
    "salary":NUMBER,
    "time_tables" : [
        {
            "day": INT,
            "start_hour": STRING,
            "finish_hour": STRING
        },
        {
            "day": NUMBER,
            "start_hour": STRING,
            "finish_hour": STRING
        }
    ]
    
}
```

**Important**

- The day's value is from 0 to 6. It represents the days from Sunday(0) to Saturday(6).
- The hour must be in 24hrs format in order to avoid some problems with the date validation

**if the request is successful the response would be:_**
```
{
    "ok": true,
    "msg": "Empleado creado correctamente con id: ale136345"
}
```

### Modify a employee

This endpoint will update an existing employee. You need to send the employee id in the url.

```
URL/employees/id_employee   /*HTTP method: PUT*/
```

* Put the value of employee id instead of "id_employee"

**You need to send an object like this in the request's body:**
```
    {
        "name": STRING,
        "surname_f": STRING,
        "surname_m": STRING,,
        "curp": STRING,
        "salary":NUMBER,
        "mobile_number": STRING,
        "mobile_back_number": STRING,
        "rfc": STRING
    }
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El empleado se actualizo correctamente"
}
```
### Delete employee

This endpoint will delete an existing employee. You need to send the employee id in the url.

```
URL/employees/c   /*HTTP method: DELETE*/
```

* Put the value of employee id instead of "id_employee"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El empleado se elimino correctamente"
}
```
## Students

### Get All students

This endpoint will return a list of all the students.

```
URL/students     /*HTTP method: GET*/
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "students": [
        {
            "id_student": "ale105083",
            "id_user": 105,
            "name": "Angel",
            "surname_f": "Retana",
            "surname_m": "Retana",
            "group_chief": 0,
            "curp": "cursps",
            "status": 1,
            "mobile_number": "6611825",
            "mobile_back_number": "4164020",
            "start_date": null,
            "end_date": null,
            "street": "address",
            "zip": "30160",
            "colony": "Huizache",
            "matricula": "DEDG202103003",
            "birthdate": "2020-06-03",
            "id_campus": 11,
            "campus_name": "El mejor campus de todos 2.0",
            "id_group": 5,
            "group_name": "3 derecho"
        },...
        ]
}
```

**If there're no students, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "students": []
    }
```

### Get stundent by matricula

This endpoint will return the stundent who match with the matricula specified.

```
URL/students/matricula     /*HTTP method: GET*/
```
* Put the value of matricula instead of "matricula"

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "student": {
        "id_student": "ale106009",
        "matricula": "DEDG202103001",
        "student_fullname": "Angel Gonzalez Vergas",
        "name_group": "2 derecho",
        "id_group": 5,
        "campus_name": "El mejor campus de todos 2.0",
        "major_name": "Licenciatura en Derecho",
        "ins_date": "2021-04-16",
        "course_name": "Español avanzado",
    }
}
```

### Create a student

This endpoint will create a new student if he does not already exist. If he already exists, the value of status will change to 1

```
URL/students    /*HTTP method: POST*/
```


**You need to send an object like this in the request's body:**


```
  {

    "email": STRING,
    "matricula": STRING,
    "name": STRING,
    "surname_f": STRING,
    "surname_m": STRING,
    "id_group": NUMBER,
    "id_campus":NUMBER,
    "group_chief": NUMBER,
    "curp": STRING,
    "mobile_number": STRING,
    "mobile_back_number": STRING,
    "birthdate":STRING,
    "street":STRING,
    "zip":STRING,
    "colony":STRING

}
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "Estudiante creado correctamente",
    "id_student": "ale111659"
}
```
### Modify a student

This endpoint will update an existing student. You need to pass the student id in the url.

```
URL/students/id_student   /*HTTP method: PUT*/
```

* Put the value of student id instead of "id_student"


**You need to send an object like this in the request's body:**

```
{
    "matricula": STRING,
    "name": STRING,
    "surname_f": STRING,
    "surname_m": STRING,
    "group_chief": BOOLEAN,
    "birthdate": STRING,
    "curp": STRING,
    "mobile_number": STRING,
    "mobile_back_number": STRING,
    "street": STRING,
    "colony": STRING,
    "zip": STRING
}
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El estudiante se actualizo correctamente"
}
```

### Delete student

This endpoint will delete an existing student. You need to send the student id in the url.

```
URL/students/id_student   /*HTTP method: DELETE*/
```

* Put the value of student id instead of "id_student"

**It's not neccesary to send a body in the request**


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El estudiante se elimino correctamente"
}
```
- Note: Talking about status: 1=active, 2=temporary, 3=definitive
## Teachers

### Get All Teachers

This endpoint will return a list of all the teachers.

```
URL/teachers     /*HTTP method: GET*/
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "teachers": [
        {
            "id_teacher": "ale108421",
            "id_user": 108,
            "name": "Johan",
            "rfc": "rfc123123sss",
            "mobile_number": "6611125",
            "id_ext_cou": null,
            "courses": 0,
            "active": 1,
            "surname_f": "Gonzalez",
            "surname_m": "Vargas",
            "campus_name": "rtyuio"
        }
    ]
}
```

**If there're no teachers, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "teachers": []
    }
```

### Create a teacher

This endpoint will create a new teacher.

```
URL/teachers    /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
  {
    "email": STRING,
    "name": STRING,
    "surname_f": STRING,
    "surname_m":STRING,
    "id_campus": NUMBER,
    "rfc": STRING,
    "mobile_number": STRING
}
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "Maestro creado correctamente",
    "id_teacher": "ale112041"
}
```

### Modify a teacher

This endpoint will update an existing teacher. You need to pass the teacher id in the url.

```
URL/teachers/Id_teacher   /*HTTP method: PUT*/
```

* Put the value of teacher id instead of "id_teacher"


**You need to send an object like this in the request's body:**
```
{
    "name": STRING,
    "surname_f": STRING,
    "surname_m": STRING,
    "rfc": STRING,
    "mobile_number": STRING,
}
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El maestro se actualizo correctamente"
}
```
### Delete teacher

This endpoint will delete an existing teacher. You need to send the teacher id in the url.

```
URL/teachers/id_teacher   /*HTTP method: DELETE*/
```

* Put the value of teacher id instead of "id_teacher"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El maestro se elimino correctamente"
}
```

### Get the courses given by teacher

This endpoint will return a list of all the courses that a teacher has given. You need to send the teacher id in the url.


```
URL/teachers/:id_teacher/courses   /*HTTP method: GET*/
```

Query params you can use:
- courseName : specify a word to search coincidences with the course name.
- status : specify the courses' status you want to filter (1 | 0 | all)  

* Put the value of teacher id instead of "id_teacher"

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "courses": [
        {
            "id_course": 5,
            "course_name": "Español avanzado",
            "id_group": 5,
            "id_major": 15,
            "group_name": "3 derecho",
            "major_name": "Licenciatura en Angel",
            "id_gro_cou": 1,
            "status": true,
            "start_date": "2021-04-04",
            "end_date": "2021-04-25",
            "type": "regular"
        },
        {
            "id_ext_cou": 2,
            "id_major": 13,
            "ext_cou_name": "Curso extra chingon",
            "start_date": "2021-07-01",
            "finish_date": "2021-07-31",
            "limit_participants": 20,
            "cost": 120.5,
            "id_teacher": "ale108421",
            "major_name": "Maestria en Johan",
            "type": "extra"
        },
        {
            "id_graduation_course": 3,
            "course_grad_name": "Curso de prueba 2",
            "start_date": "2021-11-01",
            "end_date": "2021-11-30",
            "id_teacher": "ale108421",
            "graduation_sections": [
                {
                    "id_graduation_section": 5,
                    "graduation_section_name": "Prueba 1",
                    "start_date": "2021-11-01",
                    "end_date": "2021-12-01",
                    "in_progress": 1
                },
                {
                    "id_graduation_section": 6,
                    "graduation_section_name": "Prueba 1",
                    "start_date": "2021-11-01",
                    "end_date": "2021-12-01",
                    "in_progress": 1
                }
            ],
            "teacher_name": "Johan Gonzalez Vargas",
            "isTeacherTitular": 1,
            "type": "graduation_course"
        }
    ]
}
```
--------------------------------------------------------------------
## Courses

### **Get all courses**

This endopint will find al the courses that exists, the result of this will be a list of the courses and the major that is related with it.

```
URL/courses   /*HTTP method: GET*/
```

**If the request is successful, the response would be:**

```
{
    "ok": true,
    "courses": [
        {
            "id_course": 5,
            "id_major": 13,
            "course_name": "Español avanzado",
            "major_name": "Johan"
        },
        {
            "id_course": 6,
            "id_major": 13,
            "course_name": "Español avanzado 2.0",
            "major_name": "Johan"
        }
        ...
    ]
}
```

**If there're no courses, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "courses": []
    }
```


### **Create a course**

This endopint will create a new course.

```
URL/courses    HTTP method: POST
```

**You need to send an object like this in the request's body:**
```
{
    "id_major" : INT,
    "course_name" : STRING
}
```

**If the request is successful, the response would be:**

```
{
    "ok": true,
    "msg": "Curso creado correctamente"
}
```
### **Update a course**

This endopint will update an existing course, you need to send the course id in the url.

```
URL/courses/id_course    /*HTTP method: PUT*/
```

* Put the value of course id instead of "id_course"

**You need to send an object like this in the request's body:**
```
{
    "id_major" : INT,
    "course_name" : STRING
}
```
**If the request is successful, the response would be:**

```
{
    "ok": true,
    "msg": "Curso actualizado correctamente"
}
```
### **Delete a course**

This endopint will delete course. You need to send the course id in the url.

```
URL/courses/id_course    HTTP method: DELETE
```

* Put the value of course id instead of "id_course"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**

```
{
    "ok": true,
    "msg": "Curso eliminado correctamente"
}
```

------------------------------------------------------------------------------
## Campus

### **Get all campus**

This endopint will return a list of all the campus.

```
URL/campus   /*HTTP method: GET*/
```

**If the request is successful, the response would be:**

```
{
    "ok": true,
    "campus": [
        {
            "id_campus": 10,
            "campus_name": "rtyuio",
            "street": "Pról. Cuauhtémoc #515",
            "state": "Durango",
            "municipality": "Durango",
            "colony": "fghjklñ",
            "zip": "34160"
        }
        ...
    ]
}
```
**If there're no campus, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "campus": []
    }
```

### **Create a campus**

This endopint will create a new campus.

```
URL/campus    /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
{
    "campus_name": STRING,
    "street":"STRING",
    "state" : STRING,            
    "municipality": STRING,
    "colony":"STRNG"
    "zip":"STRING",
}
```


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "Campus creado correctamente"
}
```

### **Update a campus by its id**

This endopint will update an existing campus, you need to send the campus id in the url.

```
URL/campus/id_campus   HTTP method: PUT
```

* Put the value of campus id instead of "id_campus"


**You need to send an object like this in the request's body:**
```
{
    "campus_name": STRING,
    "street":"STRING",
    "state" : STRING,            
    "municipality": STRING,
    "colony":"STRING"
    "zip":"STRING",
}
```
**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "Campus actualizado correctamente"
}
```


### **Delete a campus by its id**

This endopint will delete an existing campus. You need to send the campus id in the url.

```
URL/campus/id_campus   /*HTTP method: DELETE*/
```

* Put the value of campus id instead of "id_campus"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**

```
{
    "ok": true,
    "msg": "Campus eliminado correctamente"
}
```

------------------------------------------------------------------------------

## Scholarships

### **Get all scholarships**

This endopint will return a list of all the scholarships.

```
URL/scholarships     /*HTTP method: GET*/
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "scholarships": [
        {
            "id_scholarship": 2,
            "scholarship_name": "Exelencia",
            "percentage": 100,
            "reason": "Buenisimo alumno",
            "observations": "",
            "id_student": "ale105083",
            "matricula": "DEDG202103003",
            "student": "Angel Gonzalez Gonzalez"
        }
    ]
}
```
**If there're no scholarships, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "scholarships": []
    }
```


### **Create a scholarship**

This endopint will create a new scholarship.

```
URL/scholarships    /*HTTP method: POST*/
```


**You need to send an object like this in the request's body:**
```
{
    "matricula": STRING,
    "scholarship_name": STRING,
    "percentage": FLOAT,
    "reason": STRING,
    "observations": STRING,
}
```
**Important**
- If there's no observations send an empty string

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "La beca se creo correctamente."
}
```

### **Update a scholarship by its id**

This endopint will update an existing scholarship. You need to send the scholarship id in the url.

```
URL/scholarships/id_scholarship   /*HTTP method: PUT*/
```

* Put the value of scholarship id instead of "id_scholarship"


**You need to send an object like this in the request's body:**

```
{
    "matricula": STRING,
    "scholarship_name": STRING,
    "percentage": FLOAT,
    "reason": STRING,
    "observations": STRING,
}
```
**Important**
- If there's no observations send an empty string

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "La beca se actualizo correctamente."
}
```


### **Delete a scholarship by its id**

This endopint will delete an existing scholarship. You need to send the scholarship id in the url.

```
URL/scholarships/id_scholarship   /*HTTP method: DELETE*/
```

* Put the value of scholarship id instead of "id_scholarship"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "La beca se elimino correctamente"
}
```
------------------------------------------------------------------------------

## Grades

### **Get grades**

This endopint will return a list of the students in order to consult their grades.

Query params you can use:
- q : Specify one of the following attributes:
    + Student's matricula
    + Student's name
    + Group name

```
URL/grades/all    /*HTTP method: GET*/
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "grades": [
                {
            "id_student": "ale105083",
            "matricula": "DEDG202103003",
            "student_name": "Angel Gonzalez Gonzalez",
            "group_name": "3 derecho",
            "major_name": "Licenciatura en Angel",
            "q": "student_name"
        },
        {
            "id_student": "ale106009",
            "matricula": "DEDG202103001",
            "student_name": "Angel Gonzalez Vergas",
            "group_name": "3 derecho",
            "major_name": "Licenciatura en Angel",
            "q": "student_name"
        },...
    ]
}
```

**If there're no grades, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "grades": []
    }
```

**Important**
- The attribute "q" in each object of the array grades is the parameter the grade was found by. It could take one of the following values:
    + student_name
    + matricula
    + group_name

### **Get grades from a student by matricula**

This endopint will return the grades of a student and it will give information such as teacher who gave the class, when the student took the class and the grade the student got


```
URL/grades/students/matricula   HTTP method: GET
```

* Put the value of matricula instead of "matricula"

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "grades": [
        {
            "id_course": 6,
            "grade": 7,
            "course": "Español avanzado 2.0",
            "teacher": "Johan Gonzalez Vargas",
            "date": "Julio,2021"
        }
    ]
}
```
### **Upload grades of a group**

This endopint will upload the grades of a couse by the group's id. You need to send the course id in the url.

```
URL/grades/regular/id_course    HTTP method: POST
```
* Put the value of course id instead of "id_course"

**You need to send an object like this in the request's body:**

```
{
    "id_group": INT,
    "students" : [{
        "id_student" : STRING,
        "grade" : FLOAT
    },
    {
        "id_student" : STRING,
        "grade" : FLOAT
    },
    ...
    ]
}
```

### **Update regualar courses' grade**

This endopint will update a regular course's grade of a student. You need to send the grade id in the url.

```
URL/grades/regular/id_grade   HTTP method: PUT
```

* Put the value of grade id instead of "id_grade"

**You need to send an object like this in the request's body:**
```
{
    "grade" : FLOAT
}
```

**If the request is successful, the response would be:**
```
{
    ok:true,
    msg: 'Calificación de materia actualizada correctamente.'
}
```
### **Update extracurricular courses' grade**

This endopint will update a extracurricular course's grade of a student. You need to send the student_extracurricular id in the url.

```
URL/grades/extra/id_stu_extcou   HTTP method: PUT
```

* Put the value of student_extracurricularid instead of "id_stu_extcou"

**You need to send an object like this in the request's body:**
```
{
    "grade" : FLOAT
}
```

**If the request is successful, the response would be:**
```
{
    ok:true,
    msg: 'Calificación de curso extra curricular actualizada correctamente.'
}
```

---------------------------------------------------------
### **Get all payments**

This enpoint will give you the total money that each group has to pay, how much it has paid and how much is missing.

Query params you can use:
- major_name : specify a major and the groups which belog to that major will be returned.
- name_group : specify a group's name and the groups whose name match with the search will be returned.

If the query params are not send, the endpoint will return a list of groups without filters.

```
Endpoint  URL/payments           HTTP METHOD : GET
```
The result look like this:
```
{
    ok : true,
    payments : [
        {
            "id_group": 5,
            "name_group": "2 derecho",
            "major_name": "Licenciatura en Derecho",
            "money_exp": 2600,
            "money": 2600,
            "missing": 0
        },...
    ]
}
```
--------------------------------------------------------------
### **Get payments by group**

This endpoint will give you a list of the students which belong to the group specified, each one of the student's record contain the total money the student has to pay, how much he has paid and how much he is missing and some other info.

* Put the value of id group instead of "id_group"

```
URL/payments/groups/id_group           /*HTTP METHOD : GET*/
```
**If the request is successful, the response would be:**
```
{
    "ok": true,
    "payments": [
        {
            "student_fullname": "Angel Retana Retana",
            "matricula": "DEDG202103003",
            "id_student": "ale105083",
            "money_exp": 0,
            "money": 0,
            "missing": 0
        },
        {
            "student_fullname": "Angel Gonzalez Vergas",
            "matricula": "DEDG202103001",
            "id_student": "ale106009",
            "money_exp": 2600,
            "money": 2600,
            "missing": 0
        },...
    ]
}
```
#### **Important**

- money_exp : total money to pay.
- money     : how much money have paid.
- missing   : how much money is missing.

### **Get payments by student**

This endpoint will give you a list of the payments that a student has made, in addition, it shows the student's basic info for payments and how much money he dues and how much he has paid, each one of the payments contain the total money the student has to pay, how much he has paid and how much he is missing, moreover the payment's concept, the payment's status, which employee made it, and the date when the payment was paid.

```
URL/payments/students/matricula           /*HTTP METHOD : GET*/
```

* Put the value of student's matricula instead of "matricula"

Query params you can use:
- status : 0 (payments don't fully paid) OR 1 (payments fully paid) OR 2(the payment is close)

If the query params are not send, the endpoint will return all payments.

**If the request is successful, the response would be:**
```
{
   "ok": true,
    "student": {
        "matricula": "DEDG202103001",
        "id_student": "ale106009",
        "student_fullname": "Angel Gonzalez Vergas",
        "educational_level": "Licenciatura",
        "money_exp": 2600,
        "money": 2600,
        "missing": 0,
        "payments": [
            {
                "expected": 800,
                "current": 800,
                "name": "Inscripción a Licenciatura en Derecho",
                "missing": 0,
                "id_payment": 92,
                "id_employee": "ale104691",
                "employee_fullname": "Angel Cruz Cruz",
                "status_payment": 1,
                "payment_date": "2021-04-11",
                "last_payment_date":"2021-04-11",
                "payment_type":"Inscripción"
            },
            {
                "expected": 800,
                "current": 800,
                "id": 5,
                "name": "Español avanzado",
                "missing": 0,
                "id_payment": 93,
                "id_employee": "ale104691",
                "employee_fullname": "Angel Cruz Cruz",
                "status_payment": 1,
                "payment_date": "2021-04-11",
                "last_payment_date":"2021-04-11",
                "payment_type":"Materia"
            },...
        ]
    },...
}
```

#### **Important**
#### _Student info_
- money_exp : total money to pay.
- money     : how much money have paid.
- missing   : how much money is missing.

#### _Payments info_
- expected : total money to pay,
- current  : how much money have paid.
- missing  : how much money is missing.
- name     : payment's concept.
- status   : 0 (not fullt paid) OR 1 (fully paid) OR 2(the payment is close).
- last_payment_date : Last date a payment was paid.
- payment_type : The type of payment it was asked for.


### **Create a payment**

This endpoint will create a new payment which will containt info such student that made it, employee that attend the student, the concept and other important info.

```
Endpoint  URL/payments         /*HTTP METHOD : POST*/
```


**You need to send an object like this in the request's body:**
```
{
   matricula        : STRING,
   id_user          : INT,
   payment_method   : 'Tarjeta'   || 'Depósito'    || 'Efectivo',
   payment_type     : 'Documento' || 'Inscripción' || 'Materia',
   amount           : FLOAT,
   document_type    : INT,
   id_card          : INT,
   start_date       : INT
}
```
#### **Important**

- document_type : type of document you're are paying for,
- start_date  : number of the month that you're paying

_**Info you might want to know:**_
- If the payment_type is different to document, send null as document_type value
- If the payment_method is different to tarjeta or depósito, send null as id_card value
- If start_date is null, the system will take it as the current month when the payment is being generated.

-------------------------------------------------------------------
### Pay for payment

This endpoint will pay for a payment by its id, if the payment is fully paid, the payment's status will change from 0 to 1.

```
Endpoint  URL/payments/id_payment/payFor         /*HTTP METHOD : POST*/
```

* Put the value of payment id instead of "id_payment"


**You need to send an object like this in the request's body:**
```
{
   pay_amount       : FLOAT,
   payment_method   : 'Tarjeta'   || 'Depósito'    || 'Efectivo',
   id_card          : INT,


}
```
#### **Important**

- pay_amount : amount that you're paying

_**Info you might want to know:**_
- If the payment_method is different to tarjeta or depósito, send null as id_card value.



--------------------------------------------------------------------

### Check price for a payment

This endpoint will return the amount you have to pay for when you generated a payment, the price will take in count the posible charges that the system apply.

* Put the value of matricula instead of "matricula"

```
URL/payments/students/matricula/check         /*HTTP METHOD : POST*/
```


**You need to send an object like this in the request's body:**
```
{
    payment_type     : 'Documento' || 'Inscripción' || 'Materia',
    document_type    : INT,
    start_date       : INT  

}
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "total_to_pay": 800
}
```
#### **Important**

- document_type : type of document you're are paying for,
- start_date  : number of the month that you're paying

_**Info you might want to know:**_
- If the payment_type is different to document, send null as document_type value
- If start_date is null, the system will take it as the current month when the payment is being generated.


--------------------------------------------------------------------
### Update a payment

This endpoint will update the cutoff date of payment in case it be needed.

```
Endpoint  URL/payments/id_payment         /*HTTP METHOD : PATCH*/
``` 

* Put the value of payment id instead of "id_payment"

**You need to send an object like this in the request's body:**
```
{
    cutoff_date     :   ONLY DATE (Format : YYYY-MM-DD) 
}
```

### Delete a payment

This endpoint will delete a payment by its id, the info of the student who ask for it and the employee who attend the student will be deleted as well as the card info in case the payment would have paid with card or deposit. In case the payment was for a document, the request will be deleted as well.

```
Endpoint  URL/payments/id_payment         /*HTTP METHOD : DELETE*/
``` 

* Put the value of payment id instead of "id_payment"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : 'Pago eliminado correctamente'
}
```

----------------------------------------------------------

## Cards

### Get Cards

This endpoint will return a list of all the cards.

```
URL/cards    /*HTTP method: GET*/
```


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "cards": [
        {
            "id_card": 1,
            "card_number": "1234567891012345",
            "owner": "pablito",
            "bank": "bancomer",
            "due_date": "2021-04-09"
        },
        {
            "id_card": 2,
            "card_number": "1234567891012346",
            "owner": "pablito",
            "bank": "bancomer",
            "due_date": "2021-04-09"
        }
    ]
}
```


### Create Card

This endpoint will create a new card.

```
URL/cards    /*HTTP method: POST*/
```


**You need to send an object like this in the request's body:**
```
{
    "card_number": "1234567891012347",
    "owner": "pablito",
    "bank": "bancomer",
    "due_date": "2021-04-09"
}
```

**If the request is successful, the response would be:**
```
    {
        ok:true,
        msg: "Tarjeta creada correctamente"
    }
```


### Modify the card
This endpoint will update an existing card. You need to send the card id in the url.

```
URL/cards/id_card    /*HTTP method: PUT*/
```

* Put the value of card id instead of "id_card"

**You need to send an object like this in the request's body:**
```
{
    "card_number": "1234567891012347",
    "owner": "pablitx",
    "bank": "bancomer",
    "due_date": "2021-04-09"
}
```

**If the request is successful, the response would be:**
```
    {
        ok:true,
        msg: "Los datos de la tarjeta se actualizaron correctamente",
    }
```
## Delete a card

This endpoint will delete an existing card. You need to send the card id.

```
URL/cards/id_card    /*HTTP method: DELETE*/
```

* Put the value of card id instead of "id_card"

**It's not neccesary to send a body in the request**


**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : 'La tarjeta se eliminó conrrectamente.'
}
```
---------------------------------------------------------

## Requests

### Get requests  


This endpoint will return a list of all the requests.

```
URL/requests        /*HTTP method: GET*/
```

Query params you can use:
- date : Specify the creation date's of the request. 
    + If you put 'all', all the requests will be returned.
    + If you do not send it, its default value is today's date
- status : Specify the requests' status. 
    + It could take one of the following values : 0(not fulfilled) or 1(fulfilled)
    + If you do not send it, its default value is 0


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "requests": [
        {
            "id_request": 75,
            "status_request": 0,
            "creation_date": "9,Agosto,2021",
            "student_name": "Angel Gonzalez Gonzalez",
            "matricula": "DEDG202103003",
            "id_student": "ale105083",
            "document_name": "Certificado"
        }
    ]
}
```

### Create a request

This endpoint will create a new request.


```
URL/requests         /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
{
    "matricula" : "DE3001",
    "id_department" : 5,
    "document_type" : 3
}
```

**Important**
- To get the document type, go to the list of the documents that is in this documentation.


**If the request is successful, the response would be:**

```
{
    "ok": true,
    "msg": "Solcitud creada correctamente"
}
```


### Complete a request

```
URL/requests/id_request  /*HTTP method: POST*/
```

* Put the value of request id instead of "id_request"

**It's not neccesary to send a body in the request**

**This request's response would be an PDF file of the document type the request makes reference to**

### Delete a request

This endpoint will delete an existing request. It will delete the document and the payment which are related to the request. You need to send the request id in the url.


```
URL/requests/id_request  /*HTTP method: DELETE*/
```

* Put the value of request id instead of "id_request"

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "La peticion se elimino correctamente"
}
```

----------------------------------------------------
## Expenses

### Get expense by date

This endpoint will return a list of expenses made in the institute.

```
URL/expenses       /*HTTP method: GET*/
```

Query params you can use:
- date : Specify the creation date's of the request. 
    + If you put 'all', all the requests will be returned.
    + If you do not send it, its default value is today's date


**If the request is successful, the response would be:**

```
{
    "ok": true,
    "expenses": [
        {
            "id_expense": 1,
            "amount": 5000,
            "date": "11 de Agosto de 2021",
            "expenses_type": "Servicios básicos",
            "observation": "Una observación",
            "id_employee": "ale107102"
        }
    ]
}

```

### Create an expense

This endpoint will create a new expense.

```
URL/expenses           /*HTTP method: POST*/
```
**You need to send an object like this in the request's body:**


```
{
    "observation": STRING,
    "amount":FLOAT,
    "expense_type":INT,
    "id_user": INT

}
```

**If the request is successful, the response would be:**


```
{
    "ok": true,
    "msg": "Gasto creado correctamente"
}
```


### Update an expense

This endpoint will update an existing expense. You need to send the expense id in the url.

```
URL/expenses/id_expense     /*HTTP method: PUT*/
```

* Put the value of expense id instead of "id_expense"


**You need to send an object like this in the request's body:**
```
{
    "observation": STRING,
    "amount":FLOAT,
    "expense_type":INT

}
```

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "msg": "El gasto se actualizo correctamente"
}
```

### Delete an expense

This endpoint will delete an existing expense. You need to send the expense id in the url.

```
URL/expenses/id_expense        /*HTTP method: DELETE*/
```
**It's not neccesary to send a body in the request**


**If the request is successful, the response would be:**

```
{
    "ok": true,
    "msg": "El gasto se elimino correctamente"
}
```
----------------------------------------------------------
## Documents

### Get all documents

This endpoint will return a list of all the documents that has been created.

```
URL/documents     /* HTTP method : GET */
```

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "documents": [
        {
            "id_document": 105,
            "document_type": 0,
            "cost": 50,
            "id_student": "ale105083",
            "creation_date": null,
            "document_name": "Constancia de estudios.",
            "matricula": "DEDG202103003",
            "student_name": "Angel Gonzalez Gonzalez",
            "belongsToARequest": true
        },
        {
            "id_document": 106,
            "document_type": 0,
            "cost": 50,
            "id_student": "ale106009",
            "creation_date": "2021-08-30",
            "document_name": "Constancia de estudios.",
            "matricula": "DEDG202103001",
            "student_name": "Angel Gonzalez Vergas",
            "belongsToARequest": false
        }
    ]
}
```

**If there're no documents, the request's answer will be an empty array []. It looks like this:**
```
    {
        "ok": true,
        "documents": []
    }
```
### Create PDF file from document (without request)

```
URL/documents/document_type/students/matricula  /*HTTP method: POST*/
```

This endpoint will return the PDF file of the document type indicated filled with tha student's data matricula references to.
**The request's body changes depending on the document type**
**If document type is 2 or 3  
You need to send an object like this in the request's body:**
```
    {
        person_name : STRING
        person_workstation : STRING
    }
```
**If document type is 11
You need to send an object like this in the request's body:**
```
    {
        id_group : INT
        id_course : INT
    }
```
**If document type is any other  
You wont need to add a body to the request**

**This request's response would be an PDF file of the document type the request makes reference to**

### Get document list available to student

```
URL/documents/students/matricula/check  /*HTTP method: GET*/
```

This endpoint will return the list of documents that is available to the student who the matricula refers to.You need to send the id student in the url.

* Put the value of student matricula instead of "matricula"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
   {
    "ok": true,
    "document_types": [
        {
            "id": 0,
            "name": "Constancia de estudios.",
            "price": 50
        },
        {
            "id": 1,
            "name": "Constancia de estudios con calificaciones.",
            "price": 100
        },...
    ]
}
```
### Delete a document

This endpoint will delete an existing document. You need to send the document id in the url.

```
URL/documents/:id_document
```

* Put the value of document id instead of "id_document"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : "El documento fue eliminado correctamente."
}
```

**Important**
- If the document belongs to a request which means that someone paid for it, the document will not be deleted. In that case you need to delete the request. So then the document will be deleted.

### Types of expenses


- 0: Transporte
- 1: Artículos de limpieza
- 2: Artículos de oficina
- 3: Servicios básicos
- 4: Comida
- 5: Pagos a maestros
- 6: Pagos a personal adminisativo',
- 7: Pagos al sistema
- 8: Pagos a servicios extras
- 9: Pagos para evento

---------------------------------------------
## Assists

**Important**
Before continuing, the "attended" field that can take one of the following values:

- 0 : absence  
- 1 : attended  
- 2 : excused absence  


### Get courses which have assistance

This endpoint will return all the courses which have registered assistance in order to check the assistance after.

```
URL/assits               /*HTTP method: GET*/
```

Query params you can use:
- q : Filte the data retrieved by the search. This parameter could take one the following values:
    - a group name  

    - a course name  

    - matricula or name of a student


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "results": [
        {
            "id_student": "ale105083",
            "matricula": "DEDG202103003",
            "name": "Angel Gonzalez Gonzalez",
            "q": "student_name"
        },
        {
            "id_student": "ale106009",
            "matricula": "DEDG202103001",
            "name": "Angel Gonzalez Vergas",
            "q": "student_name"
```

**Important**  

The attribute "q" in the each instance in the array results specifies the parameter the instance was found by.



### Get all assistances of a student

This return all the assistance that a student has in all couses that he has taken. You need to send the id student in the url.

```
URL/assits/students/:id_student   /*HTTP method: GET*/
```
* Put the value of student id instead of "id_student"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    "ok": true,
    "assistence": [
        {
            "id_assistance": 4,
            "id_student": "ale105083",
            "id_course": 5,
            "course_name": "Español avanzado",
            "date_assistance": "2021-07-26",
            "attended": 1,
            "assType": "Regular Course"
        },...
    ]
}
```

### Take regular course assistance

This endpoint will register assistance of the students who belong to a group and they are taking a regular course.

```
URL/assits/courses             /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
{
    "id_gro_cou":INT,
    "studentsList":[
        {
            "id_student": STRING,
            "attended": INT
        },...
    ]
}
```

**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : "Assitencia de curso tomada correctamente"
}
```

### Take extracurricular course assistance

This endpoint will register assistance of the students who are taking a extracurricular course.

```
URL/assits/extra               /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
{
    id_ext_cou : INT
    "studentsList":[
        {
            "id_student": STRING,
            "attended": INT
        },...
    ]
}
```

**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : "Assitencia de curso extra curricular tomada correctamente"
}
```

### Take graduation section assistance
This endpoint will register assistance of the students who are taking a section of a graduation course.

```
URL/assits/grasec               /*HTTP method: POST*/
```

**You need to send an object like this in the request's body:**
```
{
    id_graduation_section : INT
    "studentsList":[
        {
            "id_student": STRING,
            "attended": INT
        },...
    ]
}
```

**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : "Assitencia de la sección de curso de graduación tomada correctamente"
}
```

### Update Assistance  

This endpoint will update an existing assistance. You need to send the assitance id in the url.

```
URL/assits/:id_assistance       /*HTTP method: PUT*/
```

* Put the value of assistance id instead of "id_assistance"

**You need to send an object like this in the request's body:**
```
{
    "attended": 2
}
```

**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : 'Asistencia actualizada correctamente'
}
```

### Delete Assistance
This endpoint will delete an existing assistance. You need to send the assitance id in the url.

```
URL/assits/:id_assistance    /*HTTP method: DELETE*/
```

* Put the value of assistance id instead of "id_assistance"

**It's not neccesary to send a body in the request**

**If the request is successful, the response would be:**
```
{
    ok : true,
    msg : 'Asistencia eliminada correctamente'
}
```


# Extracurricular courses

## Create extracurricular course
_If you want to create an extracurricular course:_
```
URL/extracurricular_courses /*HTTP method: POST*/
```
- _You have to send an object like this:_
```
{
    "id_major":"23",
    "ext_cou_name":"Pextcou",
    "start_date": "2021-04-27",
    "finish_date":"2021-06-25",
    "limit_participants":"27",
    "cost":"15",
    "id_teacher": "ale110047"
}
```
_If the response is successful you will get:_
```
{
    "ok": true,
    "msg": "Curso extra curricular creado correctamente"
}
```
## Get extracurricular courses
_We have created teo different ways to get extracurricular courses..._
- _If you want to get all extracurricular courses, please use:_
```
URL/extracurricular_courses /*HTTP method: GET*/
```
_You will obtain something like this..._
```
{
    "ok": true,
    "extraCurricularCourses": [
        {
            "id_ext_cou": 2,
            "id_major": 23,
            "ext_cou_name": "Pextcouname",
            "start_date": "2021-04-17",
            "finish_date": "2021-06-25",
            "limit_participants": 27,
            "cost": 150,
            "id_teacher": "ale109188",
            "teacher": {
                "id_teacher": "ale109188",
                "id_user": 109,
                "name": "Rafael",
                "surname_f": "Beltran",
                "surname_m": "Retana",
                "rfc": "greg435",
                "mobile_number": "4499060981",
                "courses": 0,
                "active": 1
            }
        },
        {
            "id_ext_cou": 3,
            "id_major": 23,
            "ext_cou_name": "Pextcou",
            "start_date": "2021-04-27",
            "finish_date": "2021-06-25",
            "limit_participants": 27,
            "cost": 15,
            "id_teacher": "ale110047",
            "teacher": {
                "id_teacher": "ale110047",
                "id_user": 110,
                "name": "Johan",
                "surname_f": "Gonzalez",
                "surname_m": "Vargas",
                "rfc": "rfc123123sss",
                "mobile_number": "6611125",
                "courses": 0,
                "active": 1
            }
        },
        {
            "id_ext_cou": 4,
            "id_major": 23,
            "ext_cou_name": "Otro test",
            "start_date": "2021-06-27",
            "finish_date": "2021-06-29",
            "limit_participants": 23,
            "cost": 158,
            "id_teacher": "ale110047",
            "teacher": {
                "id_teacher": "ale110047",
                "id_user": 110,
                "name": "Johan",
                "surname_f": "Gonzalez",
                "surname_m": "Vargas",
                "rfc": "rfc123123sss",
                "mobile_number": "6611125",
                "courses": 0,
                "active": 1
            }
        }
    ]
}
```
- _If you want to get all extracurricular courses that has been imparted by an specific teacher, use:_
```
URL/extracurricular_courses?teacherName=VARG /*HTTP method: GET*/
```
_You need to type the name or last name of the teacher and the endpoint will return you all the coincidences, for example..._
```
{
    "ok": true,
    "extraCurricularCourses": [
        {
            "id_ext_cou": 3,
            "id_major": 23,
            "ext_cou_name": "Pextcou",
            "start_date": "2021-04-27",
            "finish_date": "2021-06-25",
            "limit_participants": 27,
            "cost": 15,
            "id_teacher": "ale110047",
            "teacher": {
                "id_teacher": "ale110047",
                "id_user": 110,
                "name": "Johan",
                "surname_f": "Gonzalez",
                "surname_m": "Vargas",
                "rfc": "rfc123123sss",
                "mobile_number": "6611125",
                "courses": 0,
                "active": 1
            }
        },
        {
            "id_ext_cou": 4,
            "id_major": 23,
            "ext_cou_name": "Otro test",
            "start_date": "2021-06-27",
            "finish_date": "2021-06-29",
            "limit_participants": 23,
            "cost": 158,
            "id_teacher": "ale110047",
            "teacher": {
                "id_teacher": "ale110047",
                "id_user": 110,
                "name": "Johan",
                "surname_f": "Gonzalez",
                "surname_m": "Vargas",
                "rfc": "rfc123123sss",
                "mobile_number": "6611125",
                "courses": 0,
                "active": 1
            }
        }
    ]
}
```
## Update extracurricular course
_Do you want to update an specific extracurricular course?_
```
URL/extracurricular_courses/1 /*HTTP method: PUT*/
```
_In order to update the extracurricular course, do not forget put the id from that extracurricular course. In our example, we are modifying the extracurricular course number _
- _You must send an object like this:_
```
{
    "id_major":"23",
    "ext_cou_name":"Pextcouname",
    "start_date": "2021-04-17",
    "finish_date":"2021-06-25",
    "limit_participants":"25",
    "cost":"159",
    "id_teacher": "ale109188"
}
```
_If the extracurricular course does not exist, the response is:_
```
{
    "ok": false,
    "msg": "El curso extra curricular con id 1 no existe, verifíquelo por favor."
}
```
_If the response is successful:_
```
{
    "ok": true,
    "msg": "Curso extra curricular actualizado correctamente"
}
```
## Delete extracurricular course
_If you want to delete an specific extracurricular course please provide the id from the specific course. In this example is the extracurricular course number 2:_
```
URL/extracurricular_courses/2 /*HTTP method: DELETE*/
```
_In case that the course does not exist you will receive:_
````
{
    "ok": false,
    "msg": "El curso extra curricular con id 1 no existe, verifíquelo por favor."
}
```


# Graduation Courses
## Create graduation course
## Get graduation courses
## Update graduation course
## Delete graduation course
# Graduation Sections
## Create graduation section
## Get graduation sections
## Update graduation section
## Delete graduation section



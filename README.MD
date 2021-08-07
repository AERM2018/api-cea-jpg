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
    "id_role": 1,
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


**If the request is successful, the response would be:**
```
{
    "ok": true,
    "groups": [
        {
            "id_group": 6,
            "id_major": 1,
            "name_group": "1 derecho",
            "entry_year": "1000-01-01",
            "end_year": "2000-01-01",
            "major_name": "Licenciatura en derecho",
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
/api-wp/v1/students    /*HTTP method: POST*/
```


- _This endpoint you must send an object so as to create a student if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
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
URL/teachers/id_teacher/courses   /*HTTP method: GET*/
```

* Put the value of teacher id instead of "id_teacher"

**If the request is successful, the response would be:**
{
    "ok": true,
    "courses": {
        "regular": [
            {
                "id": 5,
                "status": true,
                "start_date": "2021-07-01",
                "end_date": "2021-07-30",
                "course": "Español avanzado",
                "id_group": 5,
                "id_major": 15,
                "name_group": "3 derecho",
                "entry_year": "1000-12-01",
                "end_year": "2000-01-01",
                "major_name": "Licenciatura en Angel",
                "type": "regular"
            },
            {
                "id": 6,
                "status": true,
                "start_date": "2021-07-01",
                "end_date": "2021-07-30",
                "course": "Español avanzado 2.0",
                "id_group": 5,
                "id_major": 15,
                "name_group": "3 derecho",
                "entry_year": "1000-12-01",
                "end_year": "2000-01-01",
                "major_name": "Licenciatura en Angel",
                "type": "regular"
            }
        ],
        "extra": [
            {
                "id": 2,
                "major_name": "Maestria en Johan",
                "id_major": 13,
                "ext_cou_name": "Curso extra chingon",
                "start_date": "2021-07-01",
                "finish_date": "2021-07-31",
                "limit_participants": 20,
                "cost": 120.5,
                "type": "extra"
            }
        ],
        "graduation_section": [
            {
                "id": 1,
                "course_grad_name": "graduacion prueba",
                "id_graduation_course": 1,
                "graduation_section_name": "seccion del curso de prueba",
                "start_date": "2021-08-01",
                "end_date": "2021-08-07",
                "in_progress": 1,
                "type": "graduation_section"
            }
        ]
    }
}
--------------------------------------------------------------------
## Courses

### **Get all courses**

This endopint will find al the courses that exists, the result of this will be a list of the courses and the major that is related with it.
```
Endpoint:  URL/courses   HTTP method: GET
```

The result look like:
```
{
    "ok": true,
    "courses": [
        {
            "id_course": 1,
            "major_name": "Licenciatura en derecho",
            "course_name": "Materia 1"
        },
        {
            "id_course": 2,
            "major_name": "Licenciatura en derecho",
            "course_name": "Materia 2"
        }
        ...
    ]
}
```

### **Create a course**

This endopint will create a new course, some parameters will be needed for doing it.
```
Endpoint:  URL/courses    HTTP method: POST
```

You need to send an object like this in the request's body:
```
{
    "id_major" : INT,
    "course_name" : STRING
}
```

### **Update a course by its id**

This endopint will update a existing course, you need sent in the url the id of the course that you want to update.
```
Endpoint:  URL/courses/id_course    HTTP method: PUT
```

* Put the value of id course instead of "id_course"

You need to send an object like this in the request's body:
```
{
    "id_major" : INT,
    "course_name" : STRING
}
```

### **Delete a course by its id**

This endopint will delete course, you need sent in the url the id of the course that you want to delete.
```
Endpoint:  URL/courses/id_course    HTTP method: DELETE
```

* Put the value of id course instead of "id_course"

It's not neccesary to send a body in the request.

------------------------------------------------------------------------------
## Campus

### **Get all campus**

This endopint will find all the campus that exists, the result of this will be a list of the campus with information about them.
```
Endpoint:  URL/campus   HTTP method: GET
```

The result look like:
```
{
    "ok": true,
    "campus": [
        {
            "id_campus" : 9
            "campus_name": "Alejandria",
            "street":"STRING",
            "zip":"STRING",
            "colony":"STRING"
            "state" : "Durango",            
            "municipality": "Durango",
        }
        ...
    ]
}
```

### **Create a campus**

This endopint will create a new campus, some parameters will be needed for doing it.
```
Endpoint:  URL/campus    HTTP method: POST
```

You need to send an object like this in the request's body:
```
{
    "campus_name": STRING,
    "street":"STRING",
    "zip":"STRING",
    "colony":"STRNG"
    "state" : STRING,            
    "municipality": STRING,
}
```

### **Update a campus by its id**

This endopint will update a existing campus, you need sent in the url the id of the campus that you want to update.
```
Endpoint:  URL/campus/id_campus   HTTP method: PUT
```

* Put the value of id campus instead of "id_campus"

You need to send an object like this in the request's body:
```
{
    "campus_name": STRING,
    "street":"STRING",
    "zip":"STRING",
    "colony":"STRING"
    "state" : STRING,            
    "municipality": STRING,
}
```

### **Delete a campus by its id**

This endopint will delete a campus, you need sent in the url the id of the campus that you want to delete.
```
Endpoint:  URL/campus/id_campus   HTTP method: DELETE
```

* Put the value of id campus instead of "id_campus"

It's not neccesary to send a body in the request.

------------------------------------------------------------------------------

## Scholarships

### **Get all scholarships**

This endopint will find all the scholarships that exists, the result of this will be a list of the scholarships with information about them.
```
Endpoint:  URL/scholarships   HTTP method: GET
```

The result look like:
```
{
    "ok": true,
    "scholarships": [
        {
            "id_scholarship": 1,
            "scholarship_name": "Base",
            "percentage": 100,
            "reason": "Buen alumno",
            "observations": "",
            "matricula": "An student's matricula",
            "Student": "An student's name"
        },
        ...
    ]
}
```

### **Create a scholarship**

This endopint will create a new scholarship, some parameters will be needed for doing it.
```
Endpoint:  URL/scholarships    HTTP method: POST
```


You need to send an object like this in the request's body:
```
{
    "matricula": STRING,
    "scholarship_name": STRING,
    "percentage": FLOAT,
    "reason": STRING,
    "observations": STRING,
}
```

If there's no observations send an empty string

### **Update a scholarship by its id**

This endopint will update a existing scholarship, you need sent in the url the id of the scholarship that you want to update.
```
Endpoint:  URL/scholarships/id_scholarship   HTTP method: PUT
```

* Put the value of id scholarship instead of "id_scholarship"


You need to send an object like this in the request's body:
```
{
    "matricula": STRING,
    "scholarship_name": STRING,
    "percentage": FLOAT,
    "reason": STRING,
    "observations": STRING,
}
```
If there's no observations send an empty string


### **Delete a scholarship by its id**

This endopint will delete a scholarship, you need sent in the url the id of the scholarship that you want to delete
```
Endpoint:  URL/scholarships/id_scholarship   HTTP method: DELETE
```

* Put the value of id scholarship instead of "id_scholarship"

It's not neccesary to send a body in the request

------------------------------------------------------------------------------

## Grades

### **Get grades from all groups**

This endopint will find the grades of all the groups and it will give the general average of each group


```
Endpoint:  URL/grades/   HTTP method: GET
```

The result look like:
```
{
    "ok": true,
    "groups": [
        {
            "id_group": 5,
            "name_group": "2 derecho",
            "avg": 8.025
        },...
    ]
}
```


### **Get grades from a group**

This endopint will find the grades of a group and it will give the general average of each student who belong to the group


```
Endpoint:  URL/grades/id_group   HTTP method: GET
```
* Put the value of id group instead of "id_group"
The result look like:
```
{
    "ok": true,
    "students": [
        {
            "id_student": "ale105083",
            "fullname": "Angel Retana Retana",
            "avg": 8.5
        },
        {
            "id_student": "ale106009",
            "fullname": "Angel Gonzalez Vergas",
            "avg": 7.55
        }
    ]
}
```

### **Get grades from a student**

This endopint will find the grades of a student and it will give information such as teacher who gave the class, when the student took the class and the grade the student got


```
Endpoint:  URL/grades/students/matricula   HTTP method: GET
```
* Put the value of matricula instead of "matricula"
The result look like:
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

This endopint will upload the grades of a couse by the group's id, some parameters will be needed for doing it.

The course's id needs  to be sent in the url as parameter
```
Endpoint:  URL/grades/id_course    HTTP method: POST
```
* Put the value of id course instead of "id_course"

You need to send an object like this in the request's body:
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

### **Update a grades**

This endopint will update the grades of a couse by the group's id, some parameters will be needed for doing it.

The course's id needs no to be sent in the url as parameter
```
Endpoint:  URL/grades/id_course   HTTP method: PUT
```

* Put the value of id course instead of "id_course"

You need to send an object like this in the request's body:
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




### **Delete grade of a student**

This endopint will delete a grade of a student, you need sent in the url the id of the course in which the student's grade is going to be deleted
```
Endpoint:  URL/grades/id_course   HTTP method: PUT
```

* Put the value of id course instead of "id_course"

You need to send an object like this in the request's body:
```
{
    "id_student" : STRING
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
Endpoint  URL/payments/groups/id_group           HTTP METHOD : GET
```
The result look like this:
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
#### **Info you might want to know:**

- money_exp : total money to pay.
- money     : how much money have paid.
- missing   : how much money is missing.

--------------------------------------------------------------
### **Get payments by student**

This endpoint will give you a list of the payments that a student has made, in addition, it shows the student's basic info for payments and how much money he dues and how much he has paid, each one of the payments contain the total money the student has to pay, how much he has paid and how much he is missing, moreover the payment's concept, the payment's status, which employee made it, and the date when the payment was paid.

* Put the value of student's matricula instead of "matricula"

```
Endpoint  URL/payments/students/matricula           HTTP METHOD : GET
```

Query params you can use:
- status : 0 (payments don't fully paid) OR 1 (payments fully paid) OR 2(the payment is close)

If the query params are not send, the endpoint will return payment with status 0 and 1.

The result look like this:
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

#### **Info you might want to know:**
#### _Student_
- money_exp : total money to pay.
- money     : how much money have paid.
- missing   : how much money is missing.

#### _Payments_
- expected : total money to pay,
- current  : how much money have paid.
- missing  : how much money is missing.
- name     : payment's concept.
- status   : 0 (not fullt paid) OR 1 (fully paid) OR 2(the payment is close).
- last_payment_date : Last date a payment was paid.
- payment_type : The type of payment it was asked for.

--------------------------------------------------------------
### **Create payment**

This endpoint will create a new payment which will containt info such student that made it, employee that attend the student, the concept and other important info.

* Put the value of student's matricula instead of "matricula"

```
Endpoint  URL/payments         HTTP METHOD : POST
```


You need to send an object like this in the request's body
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
#### **Info you might want to know:**

- document_type : type of document you're are paying for,
- start_date  : number of the month that you're paying

_**Important**_
- If the payment_type is different to document, send null as document_type value
- If the payment_method is different to tarjeta or depósito, send null as id_card value
- If start_date is null, the system will take it as the current month when the payment is being generated.

-------------------------------------------------------------------
### Pay for payment

This endpoint will pay for a payment by its id, if the payment is fully paid, the payment's status will change from 0 to 1.

* Put the value of payment's id instead of "id_payment"

```
Endpoint  URL/payments/id_payment/payFor         HTTP METHOD : POST
```


You need to send an object like this in the request's body
```
{
   pay_amount       : FLOAT,
   payment_method   : 'Tarjeta'   || 'Depósito'    || 'Efectivo',
   id_card          : INT,


}
```
#### **Info you might want to know:**

- pay_amount : amount that you're paying

_**Important**_
- If the payment_method is different to tarjeta or depósito, send null as id_card value.



--------------------------------------------------------------------

### Check price for a payment

This endpoint will return the amount you have to pay for when you generated a payment, the price will take in count the posible charges that the system apply.

* Put the value of matricula instead of "matricula"

```
Endpoint  URL/payments/students/matricula/check         HTTP METHOD : POST
```


You need to send an object like this in the request's body
```
{
    payment_type     : 'Documento' || 'Inscripción' || 'Materia',
    document_type    : INT,
    start_date       : INT  

}
```

The result looks like this:
```
{
    "ok": true,
    "total_to_pay": 800
}
```
#### **Info you might want to know:**

- document_type : type of document you're are paying for,
- start_date  : number of the month that you're paying

_**Important**_
- If the payment_type is different to document, send null as document_type value
- If start_date is null, the system will take it as the current month when the payment is being generated.


--------------------------------------------------------------------
### Update a payment

This endpoint will update the cutoff date of payment in case it be needed

* Put the value of payment's id instead of "id_payment"

```
Endpoint  URL/payments/id_payment         HTTP METHOD : PATCH
``` 

You need to send an object like this in the request's body
```
{
    cutoff_date     :   ONLY DATE (Format : YYYY-MM-DD) 
}
```
--------------------------------------------------------------------
### Delete a payment

This endpoint will delete a payment by its id, the info of the student who ask for it and the employee who attend the student will be deleted as well as the card info in case the payment would have paid with card or deposit. In case the payment was for a document, the request will be deleted as well.

* Put the value of payment's id instead of "id_payment"

```
Endpoint  URL/payments/id_payment         HTTP METHOD : DELETE
``` 

It's not neccesary to send a body in the request.

## Cards

### Get Cards

_Here you can get the cards_
```
Endpoint:  URL/cards    HTTP method: GET
```


_An example:_
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
_This endopint will create a new card, you need to add some parameters to create the card._
```
Endpoint:  URL/cards    HTTP method: POST
```
_You need to send an object like this in the request's body:_
```
{
    "card_number": "1234567891012347",
    "owner": "pablito",
    "bank": "bancomer",
    "due_date": "2021-04-09"
}
```
- If the request is successful you will be able to see:
```
    {
        ok:true,
        msg: "Tarjeta creada correctamente"
    }
```
- If the request is unsuccessful you will be able to see:
```
    {
        ok: false,
        msg: "Hable con el administrador",
    }
```
### Modify the card
_This endopint will update a specific card, you need to add some parameters to update the card._
```
Endpoint:  URL/cards/id_card    HTTP method: PUT
```
_You need to send an object like this in the request's body:_
```
{
    "card_number": "1234567891012347",
    "owner": "pablitx",
    "bank": "bancomer",
    "due_date": "2021-04-09"
}
```
- Remeber add the id of the card

_If we have the card correctly updated you receive:_
```
    {
        ok:true,
        msg: "Los datos de la tarjeta se actualizaron correctamente",
    }
```
## Delete a card

_This endpoint allows you to delete a specific card with the Id_

```
Endpoint:  URL/cards/id_card    HTTP method: DELETE
```
- Do not forget specify the id of card

_It's not neccesary to send a body in the request._


## Requests

### Get request by date and status

```
URL/requests /*HTTP method: GET*/
```
- Possible parameters: fecha, status
_An example could be_
```
URL/requests?fecha=2021-04-22&status=1
```
- If you put "all" in fecha you will get all the requests
_This endpoint returns the requests of the date that were created and if they are completed or not, if you don't send the date it would take the actual date by default and status in 0_

_An example_
```
{
    "ok": true,
    "data": [
        {
            "request": {
                "id_request": 77,
                "id_department": 5,
                "id_document": 99,
                "id_payment": 319,
                "status_request": 1,
                "creation_date": "2021-04-22"
            },
            "student": {
                "id_student": "ale107060",
                "matricula": "DE3001",
                "student_fullname": "cruzecito hernandez Vergas",
                "name_group": "2 derecho",
                "id_group": 5,
                "campus_name": "El mejor campus de todos 2.0",
                "major_name": "Licenciatura en Derecho",
                "ins_date": null
            },
            "id_department": 5,
            "req_pay": {
                "id_request": 77,
                "id_payment": 319,
                "status_payment": 0,
                "name": 3,
                "cost": 500
            },
            "id_document": 99
        }
    ]
}
```

### Create a request

```
URL/requests /*HTTP method: POST*/
```


- _This endpoint you must send an object so as to create a request if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
{
    "matricula" : "DE3001",
    "id_department" : 5,
    "document_type" : 3
}
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "Solcitud creada correctamente"
}
```
### Complete a request

```
URL/requests/id_request  /*HTTP method: PUT*/
```


- _In the part of the parameter put the id of the request instead of id-request_


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "La solicitud se completo correctamente"
}
```

### Delete a request

```
URL/requests/id_request  /*HTTP method: DELETE*/
```

- _This endpoint is to delete a REQUEST, you just have to put in the params the id of the request instead of id-request_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "La peticion se elimino correctamente"
}
```
## Expenses

### Get expense by date

```
URL/expenses /*HTTP method: GET*/
```
- Possible parameters: fecha
_An example could be_
```
URL/expenses?fecha=2021-04-22
```
- If you put "all" in fecha you will get all the requests
_This endpoint returns the expenses of the date that were created , if you don't send the date it would take the actual date by default_

_An example_
```
{
    "ok": true,
    "data": [
        {
            "id_expense": 6,
            "amount": 600,
            "expense_type": "Artículos de limpieza",
            "observation": "una obersavacion gg",
            "id_employee": "ale104691"
        }
    ]
}

```

### Create a expense

```
URL/expenses /*HTTP method: POST*/
```


- _This endpoint you must send an object so as to create an expense if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
{
    "observation": "una obersavacion",
    "amount":500.25,
    "expense_type":1,
    "id_user": 104

}
```


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "Gasto creado correctamente"
}
```
### Update an expense

```
URL/expenses/id_expense  /*HTTP method: PUT*/
```
- _the options that you can send in order to update an expense are:_
```
{
    "observation": "una obersavacion ggg",
    "amount":600,
    "expense_type":2

}
```

- _In the part of the parameter put the id of the expense instead of id-expense_


- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El gasto se actualizo correctamente"
}
```

### Delete an expense

```
URL/expenses/id_expense  /*HTTP method: DELETE*/
```

- _This endpoint is to delete AN EXPENSE, you just have to put in the params the id of the expense instead of id-expense_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El gasto se elimino correctamente"
}
```

## Documents
### GET INFO SO AS TO CREATE DOCUMENT

```
URL/documents/id_request  /*HTTP method: GET*/
```

- _This endpoint is to get a info so as to create the document, you just have to put in the params the id of the request instead of id-request_
- _if the request is successful the response would be:_
```
{
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
        "ins_date": "2021-04-01"
    },
    "id_student": "ale106009",
    "id_document": 102,
    "grades": {
        "course_name": "Español avanzado",
        "grade": 10
    },
    "name": "Constancia con de estudios. (Con calificaciones)"
}
}
```
- the grades of the students only will be send them when the document requires them


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




### Documents list
- 0: Constancia con de estudios. (Con calificaciones)
- 1: Constancia de estudios (Sin calificaciones)
- 2: Carta maestrante
- 3: Kardex
- 4: Credenciales
- 5: Certificado
- 6: Acta de examen
- 7: Oficio de servicio social y practicas
- 8: Titulo
- 9: Constancia de título en proceso

## Assists
### Get All Course Assistance

_It will return all registered attendance, from regular courses, extracurricular courses and graduation courses by section. If you want to use it like this, use the endpoint like this:_
```
URL/assits/*HTTP method: GET*/
```
- _If the response is successfull you will get something like this..._
```
{
    "ok": true,
    "assistence": [
        [
            {
                "id_gro_cou_ass": 1,
                "id_gro_cou": 4,
                "id_assistance": 1,
                "id_student": "ale100415",
                "gro_cou": {
                    "id_course": 8,
                    "course": {
                        "course_name": "Materia chingona 3"
                    }
                },
                "assit": {
                    "id_assistance": 1,
                    "date_assistance": "2021-07-22",
                    "attended": 2
                },
                "assType": "Regular Course"
            },
            {
                "id_gro_cou_ass": 2,
                "id_gro_cou": 4,
                "id_assistance": 2,
                "id_student": "ale100415",
                "gro_cou": {
                    "id_course": 8,
                    "course": {
                        "course_name": "Materia chingona 3"
                    }
                },
                "assit": {
                    "id_assistance": 2,
                    "date_assistance": "2021-07-29",
                    "attended": 0
                },
                "assType": "Regular Course"
            }
        ],
        [
            {
                "id_extracurricularcourses_ass": 3,
                "id_ext_cou": 2,
                "id_assistance": 10,
                "id_student": "ale108828",
                "extracurricular_course": {
                    "ext_cou_name": "Pextcouname"
                },
                "assit": {
                    "id_assistance": 10,
                    "date_assistance": "2021-07-30",
                    "attended": 1
                },
                "assType": "Extracurricular Course"
            },
            {
                "id_gra_sec_ass": 2,
                "id_graduation_section": 2,
                "id_assistance": 7,
                "id_student": "ale108828",
                "graduation_section": {
                    "graduation_section_name": "Sección prueba"
                },
                "assit": {
                    "id_assistance": 7,
                    "date_assistance": "2021-07-30",
                    "attended": 1
                },
                "assType": "Graduation Section Course"
            }
        ],
        {
            "id_gro_cou": 4,
            "id_group": 7,
            "id_course": 8,
            "status": true,
            "start_date": "2021-07-01",
            "end_date": "2021-07-31",
            "groupss": {
                "id_group": 7,
                "id_major": 23,
                "name_group": "1 derecho",
                "entry_year": "1000-01-01",
                "end_year": "2000-01-01"
            },
            "course": {
                "id_course": 8,
                "id_major": 24,
                "course_name": "Materia chingona 3"
            }
        },
        {
            "id_extracurricularcourses_ass": 3,
            "id_ext_cou": 2,
            "id_assistance": 10,
            "id_student": "ale108828",
            "extracurricular_course": {
                "id_ext_cou": 2,
                "id_major": 23,
                "ext_cou_name": "Pextcouname",
                "start_date": "2021-04-17",
                "finish_date": "2021-06-25",
                "limit_participants": 27,
                "cost": 150,
                "id_teacher": "ale109188"
            }
        }
    ]
}
```
_If you want to get assistance for specific courses (regular courses, extracurricular courses or graduation courses by section) you can filter by course name and the endpoint will return all the matches. This filter has a maximum of 10 records displayed per page. Use the endpoint like this:_
```
URL/assits?q=mat/*HTTP method: GET*/
```
- _This is an example of a search filtered by the name of courses:_
```
{
    "ok": true,
    "assistence": [
        {
            "id_gro_cou": 4,
            "id_group": 7,
            "id_course": 8,
            "status": true,
            "start_date": "2021-07-01",
            "end_date": "2021-07-31",
            "groupss": {
                "id_group": 7,
                "id_major": 23,
                "name_group": "1 derecho",
                "entry_year": "1000-01-01",
                "end_year": "2000-01-01"
            },
            "course": {
                "id_course": 8,
                "id_major": 24,
                "course_name": "Materia chingona 3"
            }
        }
    ]
}
```
_So, you are receiving assistance of courses where the name contain "mat"._

## History of regular courses
## Extracurricular course history
## History of graduation courses by sections

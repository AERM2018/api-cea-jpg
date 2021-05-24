# API CEA

## Welcome to the API for the Control escolar "Alejandria".

#### The first thing is to get access to the URL which help you to start requesting data.
URL: http://api.alejandria.edu.mx/api-ale/v1/

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

## Here is a list of the endpoint that you can consult and the neccesary parameters to do it.

**Don't forget you need the url in order to get access of any of the endpoints**

------------------------------------------------------------------------------

## Authentication

### **Login**

This endpoint will authenticate the user on the server, in case the authentication has done successfully, the endpoint will return de token needed to do any of the endpoints. 

```
Endpoint:  URL/auth/login   HTTP method: POST
```


You need send an object like this in the request's body:
```
{
    "id" : STRING,
    "password" : STRING
}
```

The result look like:
```
{
    "ok": true,
    "token" : "your token"
}
```

-------------------------------------------------------------------------------------


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
            "id_group": 6,
            "id_major": 1,
            "name_group": "1 derecho",
            "entry_year": "1000-01-01",
            "end_year": "2000-01-01",
            "major_name": "Licenciatura en derecho"
        },...
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
            "id_employee": "ale14.Angel.Cruz",
            "id_user": 14,
            "name": "Angel",
            "surname_f": "Cruz",
            "surname_m": "Cruz",
            "rfc": "rfcunico11",
            "curp": "curpunico11",
            "mobile_number": "6182593051",
            "active": 1,
            "salary": 5000,
            "campus_name": "Alejandria 222",
            "department_name": "Contraloria"
        },...
    ]
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
    "email": "email@gmail.com",
    "name": "nombre",
    "surname_f": "surname_1",
    "surname_m": "surname_2",,
    "curp": "curpunico11",
    "mobile_number": "6182593051",
    "rfc": "rfcunico11",
    "id_campus":1,
    "id_department":1,
    "salary":1000,
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
    "name": "name",
    "surname_f": "surname_1",
    "surname_m": "surname_2",,
    "curp": "curp",
    "salary":1000,
    "mobile_number": "6182593051",
    "mobile_back_number": "4223",
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
    "students": [
        {
            "matricula": "DEDG202103003",
            "id_user": 9,
            "name": "1na1me",
            "surname_f": "surname_1",
            "surname_m": "surname_2",
            "group_chief": 0,
            "curp": "cu1d1rp",
            "status": 1,
            "mobile_number": "6611825",
            "mobile_back_number": "4164020",
            "address": "address",
            "start_date": "1000-01-01",
            "end_date": "2000-01-01",
            "complete_documents": 0,
            "campus_name": "Alejandria 2"
        },...
        ]
}
```
### Get stundent by matricula

```
URL/students/matricula  /*Method http: GET*/
```
* Put the value of matricula instead of "matricula"

This endpoint will return the stundent who has the matricula specified.

The result looks like this:
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
        "course": "Español avanzado",
    }
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

    "email": "email1111@gmail.com",
    "matricula": "amatricula",
    "name": "1na1me",
    "surname_f": "surname_1",
    "surname_m": "surname_2",
    "id_group": 1,
    "id_campus":1,
    "group_chief": 0,
    "curp": "cu1d1rp",
    "mobile_number": "6611825",
    "mobile_back_number": "4164020",
    "birthdate":"2021-09-22",
    "street":"huizache 1",
    "zip":"34160",
    "colony":"circuito peten"


    
    
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
    "matricula": "DEDG202103002",
    "name": "Angel",
    "surname_f": "Gonzalez",
    "surname_m": "Gonzalez",
    "group_chief": 0,
    "birthdate": "2020-06-03",
    "curp": "curp",
    "mobile_number": "6611825",
    "mobile_back_number": "4164020",
    "street": "address",
    "colony": "Huizache",
    "zip": "30160"
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
URL/students/Id_student   /*Method http: DELETE*/
```
- _This endpoint is to delete a student, you just have to put in the params the id of the student instead of matricula_
- _if the request is successful the response would be:_
```
{
    "ok": true,
    "msg": "El estudiante se elimino correctamente"
}
```
- Note: Talking about status: 1=active, 2=temporary, 3=definitive
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
    "teachers": [
        {
            "id_teacher": "ale15.Johan.Vargas",
            "id_user": 15,
            "name": "Johan",
            "surname_f": "Gonzalez",
            "surname_m": "Vargas",
            "rfc": "rfc11121",
            "mobile_number": "6181266320",
            "id_ext_cou": null,
            "courses": 0,
            "active": 1,
            "campus_name": "Alejandria 222"
        },...
    ]
```
### Create a teacher

```
/api-wp/v1/teachers    /*Method http: POST*/
```


- _This endpoint you must send an object so as to create a teacher if you send something wrong it won't create anything_
- _The next object is an example to know how to send it_
```
  {
    "email": "emmail1234@gmail.com",
    "name": "1na11me",
    "surname_f": "surname_1",
    "surname_m": "surname_2",
    "id_campus":1,
    "rfc": "rf1c121",
    "mobile_number": "6611125"
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
    "surname_f": "surname_1",
    "surname_m": "surname_2",
    "rfc": "rf1c121",
    "mobile_number": "6611125",
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

You need send an object like this in the request's body:
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

You need send an object like this in the request's body:
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

You need send an object like this in the request's body:
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

You need send an object like this in the request's body:
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


You need send an object like this in the request's body:
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


You need send an object like this in the request's body:
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

### **Get grades from a group of a specific course**

This endopint will find all the scholarships that exists, the result of this will be a list of the scholarships with information about them.

The course's id and group's id need to be sent as parameter
```
Endpoint:  URL/grades/id_course?id_group=id_group   HTTP method: GET
```

* Put the value of id group after the "=" in "id_group="
* Put the value of id course instead of "id_course"


The result look like:
```
{
   "ok": true,
    "grades": [
        {
            "id_course": 5,
            "course_name": "Materia 1",
            "id_student": "DEDG202103001",
            "student_full_name": "Angel Solis",
            "grade": 8.1
        },
        {
            "id_course": 5,
            "course_name": "Materia 1",
            "id_student": "DEDG202103002",
            "student_full_name": "Hugo Fernandez",
            "grade": 10
        }...
    ]
}
```

### **Upload grades of a group**

This endopint will upload the grades of a couse by the group's id, some parameters will be needed for doing it.

The course's id needs no to be sent in the url as parameter
```
Endpoint:  URL/grades/id_course    HTTP method: POST
```
* Put the value of id course instead of "id_course"

You need send an object like this in the request's body:
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

You need send an object like this in the request's body:
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

You need send an object like this in the request's body:
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
        "student_fullname": "Angel Gonzalez Vergas"
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
                "payment_date": "2021-04-11"
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
                "payment_date": "2021-04-11"
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

--------------------------------------------------------------
### **Create payment**

This endpoint will create a new payment which will containt info such student that made it, employee that attend the student, the concept and other important info.

* Put the value of student's matricula instead of "matricula"

```
Endpoint  URL/payments         HTTP METHOD : POST
```


You need send an object like this in the request's body
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


You need send an object like this in the request's body
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


You need send an object like this in the request's body
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

You need send an object like this in the request's body
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
_You need send an object like this in the request's body:_
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
_You need send an object like this in the request's body:_
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
URL/requests /*Method http: GET*/
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
URL/requests /*Method http: POST*/
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
URL/requests/id_request  /*Method http: PUT*/
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
URL/requests/id_request  /*Method http: DELETE*/
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
URL/expenses /*Method http: GET*/
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
URL/expenses /*Method http: POST*/
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
URL/expenses/id_expense  /*Method http: PUT*/
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
URL/expenses/id_expense  /*Method http: DELETE*/
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
URL/documents/id_request  /*Method http: GET*/
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

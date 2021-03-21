# API CEA

## Welcome to the API for the Control escolar "Alejandria".

#### The first thing is to get access to the URL which help you to start requesting data.
URL: https://api-cea-jpg.herokuapp.com/api-ale/v1/

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
    "email": "email@gmail.com",
    "name": "nombre",
    "surname": "apellido",
    "curp": "curpunico11",
    "mobile_number": "6182593051",
    "rfc": "rfcunico11",
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

    "email": "email1111@gmail.com",
    "id_student": "amatricula",
    "name": "1na1me",
    "surname": "s1ur1name",
    "id_group": 1,
    "id_campus":1,
    "group_chief": 0,
    "curp": "cu1d1rp",
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
    "group_chief": 0,
    "curp": "cu1d1rp",
    "status": 2,
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
    "email": "emmail1234@gmail.com",
    "name": "1na11me",
    "surname": "s1u1r1name",
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
    "surname": "s1u1r1name",
    "rfc": "rf1c121",
    "active": 1,
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
            "campus_name": "Alejandria",
            "municipality": "Durango",
            "address": "fake addreess #105"
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
    "id_municipality" : INT,
    "campus_name" : STRING,
    "address" : STRING
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
    "id_municipality" : INT,
    "campus_name" : STRING,
    "address" : STRING
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
            "id_student": "An student's id",
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
    "id_student": STRING,
    "scholarship_name": STRING,
    "percentage": FLOAT,
    "reason": STRING,
    "observations": STRING,
}
```

If there's no reason send an empty string

### **Update a scholarship by its id**

This endopint will update a existing scholarship, you need sent in the url the id of the scholarship that you want to update.
```
Endpoint:  URL/scholarships/id_scholarship   HTTP method: PUT
```

* Put the value of id scholarship instead of "id_scholarship"


You need send an object like this in the request's body:
```
{
    "id_student": STRING,
    "scholarship_name": STRING,
    "percentage": FLOAT,
    "reason": STRING,
    "observations": STRING,
}
```
If there's no reason send an empty string


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
    "scholarships": [
        {
            "id_scholarship": 1,
            "scholarship_name": "Base",
            "percentage": 100,
            "reason": "Some reason",
            "observations": "",
            "id_student": "An student's id",
            "Student": "An student's name"
        },
        ...
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

If there's no reason send an empty string


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


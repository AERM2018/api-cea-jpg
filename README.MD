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


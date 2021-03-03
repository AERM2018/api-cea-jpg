const express = require('express');
const cors = require('cors');
const statesRouter = require('../routes/states');
const municipalitiesRouter = require('../routes/municipalities');
const campusRouter = require('../routes/campus');
const coursesRouter = require('../routes/courses');


class Server{

    app = express.application;
    base = '';
    port = '';
    apiPaths = {};

   
    constructor(){
        this.app = express();
        this.port = process.env.port || 4000
        this.middlewares();
        this.base = 'api-ale/v1'
        this.apiPaths = {
            states : `/${this.base}/states`,
            municipalities : `/${this.base}/municipalities`,
            campus : `/${this.base}/campus`,
            courses : `/${this.base}/courses`
        }
        this.routes();
    }


    middlewares(){
        this.app.use( cors() );
        this.app.use( express.json() );
        this.app.use( express.urlencoded({extended:true}));
    }


    routes(){
        this.app.use(this.apiPaths.states, statesRouter);
        this.app.use(this.apiPaths.municipalities, municipalitiesRouter);
        this.app.use(this.apiPaths.campus, campusRouter);
        this.app.use(this.apiPaths.courses, coursesRouter);

    }
    listen(){
        this.app.listen( this.port, () => {
            console.log(`server listening on the port ${this.port}`)
        })
    }

    
}


module.exports = Server;
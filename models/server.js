const express = require('express');
const cors = require('cors');
const statesRouter = require('../routes/states');
const municipalitiesRouter = require('../routes/municipalities');
const campusRouter = require('../routes/campus');
const majorsRouter=require('../routes/majors')
const departmentsRouter=require('../routes/departments')


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
            majors : `/${this.base}/majors`,
            departments: `/${this.base}/departments`,

        }
        this.routes();
    }

    middlewares(){
        this.app.use( cors() );
        this.app.use( express.json() );
    }

    routes(){
        this.app.use(this.apiPaths.states, statesRouter);
        this.app.use(this.apiPaths.municipalities, municipalitiesRouter);
        this.app.use(this.apiPaths.campus, campusRouter)
        this.app.use(this.apiPaths.majors, majorsRouter)
        this.app.use(this.apiPaths.departments, departmentsRouter)
    }
    listen(){
        this.app.listen( this.port, () => {
            console.log(`server listening on the port ${this.port}`)
        })
    }
    
}

module.exports = Server;
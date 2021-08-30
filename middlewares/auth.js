const { response, request } = require("express");
// const rateLimit = require('express-rate-limit')
const { RateLimiterMySQL } = require("rate-limiter-flexible");
const { db } = require("../database/connection");
const loginRateLimit = (req = request, res, next) => {

  const limiter = new RateLimiterMySQL(
    { storeClient: db, tableCreated : true, points: 3, duration: 60*2 , blockDuration : 60 }
  );

  limiter
    .consume(req.ip, 1)
    .then((res) => {
      console.log(res);
      next();
    })
    .catch((err) => {
      console.log(err);
      res.status(429).json({
        ok: false,
        msg :
          `El numero de intentos de inicio de sesión fue superado, espere ${Math.round((err.msBeforeNext/1000))
        } segundos y vuelva a intarlo`,
      });
    });
  // console.log("rate limit")
  // const limiter = rateLimit({
  //     windowMs : 1000,
  //     max : 1,
  //     message : "El numero de intentos de inicio de sesión fue superado, espere 5 minutos y vuelva a intarlo"
  // })
  // return limiter
};

module.exports = {
  loginRateLimit,
};

const { response, request } = require("express");
const moment = require('moment');
// const rateLimit = require('express-rate-limit')
const { RateLimiterMySQL } = require("rate-limiter-flexible");
const { db } = require("../database/connection");
const { secondsToString } = require("../helpers/dates");
const FailedLoginAttemps = require("../models/failed_login_attemps");
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
};

const loginFailedAttempsLimiter = async( req = request, res, next) => {
  const {ip} = req
  const timeBlocked = 15 // time in seconds
  const numAttempsAllowed = 3
  let failedAttemps =  await FailedLoginAttemps.findAll({where:{ip_address:ip},raw:true})
  // Block when the number of attemps is reached
  if (failedAttemps.length === numAttempsAllowed) {
    const unixLastAttemp = failedAttemps[failedAttemps.length - 1].date;
    const unixCurrentTime = moment().unix();
    let timeBeforeNext = unixLastAttemp + timeBlocked - unixCurrentTime;
    if (unixCurrentTime < unixLastAttemp + timeBlocked) {
      return res.status(429).json({
        ok: false,
        msg: `El numero de intentos de inicio de sesión fallido fue superado, espere ${secondsToString(
          timeBeforeNext
          )} para volver a intarlo`,
        });
      } else {
        // When the time of blocking is over, restart the counter
        await FailedLoginAttemps.destroy({ where: { ip_address: ip } });
        failedAttemps = []

      }
    }
    req.numFailedAttemps = numAttempsAllowed- failedAttemps.length ;
  next();
}

module.exports = {
  loginRateLimit,
  loginFailedAttempsLimiter,
};

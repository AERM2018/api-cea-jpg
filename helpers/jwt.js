const { sign } = require('jsonwebtoken');
const createJWT = (id_user, email, user_type, roles) => {
    return new Promise((resolve, reject) => {
        const payload = { id_user, email, user_type, roles }
        sign(payload, process.env.SECRET_JWT, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                console.log(err)
                reject('No se pudo generar el token')
            }

            resolve(token)
        })
    })
}

const createPasswordJWT = (id_user, email) => {
    return new Promise((resolve, reject) => {
        const payload = { id_user, email }
        sign(payload, process.env.PASSWORD_JWT, {
            expiresIn: '5m'
        }, (err, token) => {
            if (err) {
                console.log(err)
                reject('No se pudo generar el token de contraseña')
            }

            resolve(token)
        })
    })
}


module.exports = {
    createJWT,
    createPasswordJWT
}
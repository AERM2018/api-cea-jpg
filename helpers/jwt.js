const { sign } = require('jsonwebtoken');
const createJWT = (id_user, email, user_type, id_role) => {
    return new Promise((resolve, reject) => {
        const payload = { id_user, email, user_type, id_role }
        sign(payload, process.env.SECRET_JWT, {
            expiresIn: '2h'
        }, (err, token) => {
            if (err) {
                console.log(err)
                reject('No se pudo generar el token')
            }

            resolve(token)
        })
    })

}


module.exports = {
    createJWT
}
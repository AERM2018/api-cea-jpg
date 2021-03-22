const generateMatricula = (id_user) => {
    const dateId = Date.now().toString().substr(-3)
    return `ale${id_user.toString()}${dateId}`
}

module.exports = generateMatricula;
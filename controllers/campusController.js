
const getAllCampus = ( req, res ) => {
    res.status(200).json({
        msg : "get all campus"
    })
}


module.exports = {
    getAllCampus
}

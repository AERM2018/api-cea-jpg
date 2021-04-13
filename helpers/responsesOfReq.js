const sendResponse = ( res, StatusCode = 200, msg = "", extra = {}) => {
    const ok = (StatusCode < 400) ? true : false;
    res.status(StatusCode).json({
        ok,
        msg,
        extra
    })
}

const printAndSendError = ( res, error ) => {
    console.log(error)
    return res.status(500).json({
        ok: false,
        msg: "Hable con el administrador"
    })
}

module.exports = {
    sendResponse,
    printAndSendError
}
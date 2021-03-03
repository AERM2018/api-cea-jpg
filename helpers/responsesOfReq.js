const sendResponse = ( res, StatusCode = 200, msg = "", extra = {}) => {
    const ok = (StatusCode < 400) ? true : false;
    res.status(StatusCode).json({
        ok,
        msg,
        extra
    })
}

module.exports = {
    sendResponse
}
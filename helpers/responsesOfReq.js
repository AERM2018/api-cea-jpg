const sendResponse = (res, StatusCode = 200, msg = "", extra = {}) => {
  const ok = StatusCode < 400 ? true : false;
  res.status(StatusCode).json({
    ok,
    msg,
    extra,
  });
};

const printAndSendError = (res, error) => {
  console.log(error);
  let msg = "";
  if (error.parent?.sqlState === "23000") {
    msg =
      "No se ha podido borrar el registro debido a que se encuentra relacionado con otros registros. Hable con el admistrador. ";
  } else {
    msg = "Hable con el administrador";
  }
  return res.status(500).json({
    ok: false,
    msg,
  });
};

module.exports = {
  sendResponse,
  printAndSendError,
};

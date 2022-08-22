const axios = require("axios");
const createMoodleAccount = async (student, institucionalEmail) => {
  const wsFunction = "auth_email_signup_user";
  const moodleRestFormat = "json";
  const studentMatricula = student.matricula.toLowerCase();
  const user = {
    username: studentMatricula,
    firstName: student.name,
    lastName: `${student.surname_m} ${student.surname_f}`,
    password: `${studentMatricula
      .charAt(0)
      .toUpperCase()}${studentMatricula.slice(1)}$`,
    email: institucionalEmail.toLowerCase(),
    toQueryString: ({ username, firstName, lastName, email, password }) => {
      return `username=${username}&firstname=${firstName}&lastname=${lastName}&email=${email}&password=${password}`;
    },
  };
  const url = `${process.env.MOODLE_API_URI}?wstoken=${
    process.env.MOODLE_TOKEN
  }&wsfunction=${wsFunction}&moodlewsrestformat=${moodleRestFormat}&${user.toQueryString(
    user
  )}`;
  return await axios.default.post(url);
};

module.exports = {
  createMoodleAccount,
};

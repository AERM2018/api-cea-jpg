const keys = require("api-cea-key-file.json");
const { JWT } = require("google-auth-library");

const client = new JWT({
  email: keys.client_email,
  key: keys.private_key,
  subject: process.env.CONTROL_ESCOLAR_EMAIL,
  scopes: [process.env.GCLOUD_USERS_SCOPE],
});

const createGoogleAccount = async (student) => {
  // Makes an authenticated API request.
  let body;
  try {
    body = {
      name: {
        givenName: student.name,
        familyName: `${student.surname_m} ${student.surname_f}`,
      },
      password: student.matricula,
      primaryEmail: `${student.matricula}@alejandria.edu.mx`,
    };
    body = JSON.stringify(body);
    const url = `https://admin.googleapis.com/admin/directory/v1/users`;
    const res = await client.request({
      url,
      body,
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return { ok: true, res, email: JSON.parse(body).primaryEmail };
  } catch (err) {
    console.error("ERROR:", err);
    return { ok: false, err, email: JSON.parse(body).primaryEmail };
  }
};

const changeGoogleAcountStatus = async (email, isSuspensd) => {
  try {
    let body = {
      suspended: isSuspensd,
    };
    body = JSON.stringify(body);
    const url = `https://admin.googleapis.com/admin/directory/v1/users/${email}`;
    const res = await client.request({
      url,
      body,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    return { ok: true, res, email: JSON.parse(body).primaryEmail };
  } catch (err) {
    console.error("ERROR:", err);
    return { ok: false, err };
  }
};
module.exports = {
  createGoogleAccount,
  changeGoogleAcountStatus,
};

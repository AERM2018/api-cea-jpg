const keys = require(process.env.GCLOUD_KEY_FILE_PATH);
const { JWT } = require("google-auth-library");

const createGoogleAccount = async (student) => {
  // Makes an authenticated API request.
  let body;
  try {
    const client = new JWT({
      email: keys.client_email,
      key: keys.private_key,
      subject: process.env.CONTROL_ESCOLAR_EMAIL,
      scopes: [process.env.GCLOUD_USERS_SCOPE],
    });
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

module.exports = {
  createGoogleAccount,
};

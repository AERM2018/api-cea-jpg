const keys = require(process.env.GCLOUD_KEY_FILE_PATH);
const { JWT } = require("google-auth-library");

const listGoogleUsers = async () => {
  // Makes an authenticated API request.
  try {
    const client = new JWT({
      email: keys.client_email,
      key: keys.private_key,
      subject: process.env.CONTROL_ESCOLAR_EMAIL,
      scopes: [process.env.GCLOUD_USERS_SCOPE],
    });
    const body = {
      name: {
        givenName: "Test Test",
        familyName: "Retana Martinez",
      },
      password: "Qwerty*123",
      primaryEmail: "testRetana@alejandria.edu.mx",
    };
    const url = `https://admin.googleapis.com/admin/directory/v1/users`;
    const res = await client.request({
      url,
      body: JSON.stringify(body),
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return;
  } catch (err) {
    console.error("ERROR:", err);
  }
};

module.exports = {
  listGoogleUsers,
};

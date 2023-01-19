import fs from 'node:fs/promises';

async function upsertFile(name, contents = '') {
	try {
		// try to read file
		await fs.readFile(name);
	} catch (error) {
		// create empty file, because it wasn't found
		await fs.writeFile(name, contents);
	}
}

// Creates the files before init.
async function init() {
	const env = `
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SMTP_PORT=
TEST_EMAIL=
SHEETID=
SUBJECT=

`;

	await upsertFile('.env', env);

	await upsertFile('message.txt', 'Email body here');

	const auth = `
	{
		"type": "",
		"project_id": "",
		"private_key_id": "",
		"private_key": "",
		"client_email": "",
		"client_id": "",
		"auth_uri": "",
		"token_uri": "",
		"auth_provider_x509_cert_url": "",
		"client_x509_cert_url": ""
	}
`;

	await upsertFile('auth.json', auth);
}

init();

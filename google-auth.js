import fs from 'node:fs/promises';

import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function load() {
	const doc = new GoogleSpreadsheet(process.env.SHEETID);

	const file = await fs.readFile('auth.json');
	const creds = JSON.parse(file);

	// Authentication
	await doc.useServiceAccountAuth(creds);

	await doc.loadInfo();

	return doc;
}

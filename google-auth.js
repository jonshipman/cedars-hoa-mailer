import fs from 'node:fs/promises';

import { GoogleSpreadsheet } from 'google-spreadsheet';

export async function load(id = process.env.SHEETID) {
	const doc = new GoogleSpreadsheet(id);

	const file = await fs.readFile('auth.json');
	const creds = JSON.parse(file);

	// Authentication
	await doc.useServiceAccountAuth(creds);

	await doc.loadInfo();

	return doc;
}

import fs from 'node:fs/promises';

import csv from 'csvtojson';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
let SMTP_PORT = process.env.SMTP_PORT;

if (SMTP_PORT) {
	SMTP_PORT = parseInt(SMTP_PORT);
}

const subject = '📢 SUBJECT';
const text = `
MESSAGE.
<br/><br/>
The Cedars Board 🌲
`;

async function processFile() {
	const csvFilePath = await fs.realpath('directory.csv');

	const residents = await csv().fromFile(csvFilePath);

	// const residents = [{ Email: process.env.TEST_EMAIL }];

	// Bail if there are no envvars.
	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
		return;
	}

	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: SMTP_PORT,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
	});

	const emails = [];

	for (const resident of residents) {
		let email = resident.Email;

		if (email.includes(',')) {
			email = email
				.split(',')
				.filter((x) => !!x)
				.map((x) => x.trim());
		} else if (email.includes('\n')) {
			email = email
				.split('\n')
				.filter((x) => !!x)
				.map((x) => x.trim());
		}

		if (!email) {
			continue;
		}

		if (Array.isArray(email) && 0 === email.length) {
			continue;
		}

		if (Array.isArray(email)) {
			for (const e of email) {
				emails.push(e);
			}
		} else {
			emails.push(email);
		}
	}

	console.log(emails);

	try {
		await transporter.sendMail({
			from: 'The Cedars HOA <' + SMTP_FROM + '>',
			replyTo: 'board@the-cedars.org',
			to: 'board@the-cedars.org',
			bcc: emails,
			html: text,
			subject,
		});
	} catch (e) {
		console.error(e.message);
	}
}

processFile();

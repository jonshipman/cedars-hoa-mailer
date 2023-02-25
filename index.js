import './init.js';

import fs from 'node:fs/promises';

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

import { load } from './google-auth.js';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM;
let SMTP_PORT = process.env.SMTP_PORT;

if (SMTP_PORT) {
	SMTP_PORT = parseInt(SMTP_PORT);
}

const subject = process.env.SUBJECT;

async function mail() {
	// Bail if there are no envvars.
	if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
		return;
	}

	let text = await fs.readFile('message.txt');
	text = text.toString();

	if (process.env.NL) {
		text = text.split('\n').join('<br />');
	}

	if (!text.includes('</') && !text.includes('/>')) {
		text = text.replace(/\n/g, '<br/>');
	}

	const doc = await load();
	const sheet = doc.sheetsByIndex[0];
	const rows = await sheet.getRows();
	let emails = rows
		.map((x) => x.Email.split(','))
		.flat()
		.map((x) => x.trim())
		.filter((x) => !!x);

	// Bail if there are no emails.
	if (!emails || !emails.length) {
		console.error('Issue with the Google connection. No emails returned.');
		return;
	}

	if (process.env.TEST_EMAIL) {
		emails = [process.env.TEST_EMAIL];
	}

	const transporter = nodemailer.createTransport({
		host: SMTP_HOST,
		port: SMTP_PORT,
		auth: {
			user: SMTP_USER,
			pass: SMTP_PASS,
		},
	});

	console.log('Email count:', emails.length);

	let [list, chunkSize] = [emails, 90];
	list = [...Array(Math.ceil(list.length / chunkSize))].map((_) =>
		list.splice(0, chunkSize)
	);

	for (const bcc of list) {
		try {
			await transporter.sendMail({
				from: 'The Cedars HOA <' + SMTP_FROM + '>',
				replyTo: 'board@the-cedars.org',
				to: 'board@the-cedars.org',
				bcc,
				html: text,
				subject,
			});
		} catch (e) {
			console.error(e.message);
		}
	}
}

mail();

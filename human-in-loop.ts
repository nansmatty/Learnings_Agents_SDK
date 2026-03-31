import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';
import readline from 'node:readline/promises';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const getWeatherTool = tool({
	name: 'get-weather',
	description: 'Returns the current weather report for a given location.',
	parameters: z.object({
		location: z.string().describe('The location to get the weather report for.'),
	}),
	async execute({ location }) {
		const url = `https://wttr.in/${location.toLowerCase().replace(/\s+/g, '-')}?format=%C+%t`;
		const response = await axios.get(url, { responseType: 'text' });
		return `The current weather in ${location} is ${response.data}.`;
	},
});

const sendEmailTool = tool({
	name: 'send-email',
	description: 'Sends an email with the specified subject and content to the given recipient.',
	parameters: z.object({
		recipient: z.email().describe('The email address of the recipient.'),
		subject: z.string().describe('The subject of the email.'),
		html: z.string().describe('Html body of the email.'),
	}),

	needsApproval: true,

	async execute({ recipient, subject, html }) {
		try {
			await resend.emails.send({
				from: 'Acme <onboarding@resend.dev>', // Replace with your verified sender email
				to: recipient,
				subject: subject,
				html: html,
			});
			return `Email sent successfully to ${recipient}.`;
		} catch (error) {
			console.error('Error sending email:', error);
			return `Failed to send email to ${recipient}.`;
		}
	},
});

const agent = new Agent({
	name: 'Weather Email Agent',
	instructions: 'You are an expert agent in getting weather info and sending it using email.',
	tools: [getWeatherTool, sendEmailTool],
});

async function askForUserConfirmation(question: string) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const answer = await rl.question(`${question} (y/n): `);
	const normalizedAnswer = answer.toLowerCase();
	await rl.close();
	return normalizedAnswer === 'y' || normalizedAnswer === 'yes';
}

async function getWeatherReport(query = '') {
	let result = await run(agent, query);
	let hasInterruption = result.interruptions.length > 0;

	// console.log({ result, hasInterruption });

	while (hasInterruption) {
		const currentState = result.state;

		// console.log({ currentState });

		for (const interupt of result.interruptions) {
			if (interupt.type === 'tool_approval_item') {
				const isAllowed = await askForUserConfirmation(
					`Agent ${interupt.agent.name} is asking for calling tool ${interupt.name} with args ${JSON.stringify(interupt.arguments)}`,
				);

				if (isAllowed) {
					currentState.approve(interupt);
				} else {
					currentState.reject(interupt);
				}
				result = await run(agent, currentState);
				hasInterruption = result.interruptions?.length > 0;
			}
		}
	}
}

getWeatherReport('Extract the weather information of netherlands and and send me on narayanmaitysp1997@gmail.com');

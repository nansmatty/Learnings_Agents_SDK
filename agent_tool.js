import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';

const GetWeatherResultSchema = z.object({
	location: z.string().describe('The location for which the weather report is generated.'),
	weather: z.string().describe('The degree celcius in the specified location.'),
	condition: z.string().optional().describe('The weather condition, e.g., sunny, rainy, etc.'),
});

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

// TODO: Add more tools to the agent specially email tool to sent the weather report to the recommended user email address in this case use Resend API to send the email.

const sendEmailTool = tool({
	name: 'send-email',
	description: 'Sends an email with the given subject and body to the specified recipient.',
	parameters: z.object({
		recipient: z.string().describe('The email address of the recipient.'),
		subject: z.string().describe('The subject of the email.'),
		body: z.string().describe('The body of the email.'),
	}),
	async execute({ recipient, subject, body }) {
		// Implement the logic to send an email using Resend API or any email service provider.
		// For example, you can use axios to make a POST request to the Resend API endpoint with the email details.
		console.log(`Email sent to ${recipient} with subject "${subject}" and body "${body}".`);
	},
});

const agent = new Agent({
	name: 'Weather Agent',
	instructions: `You are an expert weather agent that helps users to tell weather report.`,
	tools: [getWeatherTool, sendEmailTool],
	outputType: GetWeatherResultSchema,
});

async function getWeatherReport(query = '') {
	const result = await run(agent, query);
	console.log(`Weather report: `, result.finalOutput);
}

getWeatherReport('Extract the weather information of switzerland and austria.');

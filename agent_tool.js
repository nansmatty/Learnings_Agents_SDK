import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import axios from 'axios';

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

const agent = new Agent({
	name: 'Weather Agent',
	instructions: `You are an expert weather agent that helps users to tell weather report.`,
	tools: [getWeatherTool],
});

async function getWeatherReport(query = '') {
	const result = await run(agent, query);
	console.log(`Weather report: `, result.finalOutput);
}

getWeatherReport('What is the weather like in germany berlin?');

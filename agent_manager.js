import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import fs from 'node:fs/promises';

const fetchAvailablePlans = tool({
	name: 'fetch_available_plans',
	description: 'Fetch the available internet broadband plans for the user.',
	parameters: z.object({}),
	async execute() {
		// Simulate fetching plans from a database or API
		return [
			{ name: 'Basic Plan', speed: '100 Mbps', price_inr: 599 },
			{ name: 'Premium Plan', speed: '500 Mbps', price_inr: 799 },
			{ name: 'Ultimate Plan', speed: '1 Gbps', price_inr: 1199 },
		];
	},
});

const processRefund = tool({
	name: 'process_refund',
	description: 'This tool processes the refund for a customer',
	parameters: z.object({
		customer_id: z.string().describe('The unique identifier for the customer.'),
		reason: z.string().describe('The reason for the refund request.'),
	}),
	async execute({ customer_id, reason }) {
		await fs.appendFile('./refunds.txt', `Refund for Customer having ID ${customer_id} for ${reason}\n`, 'utf-8');
		return { success: true, message: `Refund processed for customer ${customer_id}` };
	},
});

const refundAgent = new Agent({
	name: 'Refund Agent',
	instructions: 'You are an expert in issuing refunds to the customer.',
	tools: [processRefund],
});

const salesAgent = new Agent({
	name: 'Sales Agent',
	instructions: 'You are an expert sales agent for an internet broadband company. Talk to the user and help them with what they need.',
	tools: [
		fetchAvailablePlans,
		refundAgent.asTool({
			toolName: 'refund_expert',
			toolDescription: 'Handles refund questions and requests',
		}),
	],
});

async function runAgent(query = '') {
	const result = await run(salesAgent, query);
	console.log('Agent Response:', result.finalOutput);
}

// Example usage
runAgent('Hey there, I had a plan 599. I need a refund right now. My customer id is cus_123 because of I am shifiting to another city.');

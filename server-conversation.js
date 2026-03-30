import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

const executeSQL = tool({
	name: 'executeSQL',
	description: 'Executes a SQL query against the database.',
	parameters: z.object({
		sqlQuery: z.string().describe('The SQL query to execute.'),
	}),
	async execute({ sqlQuery }) {
		console.log(`[SQL]: Execute ${sqlQuery}`);
		return 'Done';
	},
});

const sqlAgent = new Agent({
	name: 'SQL Expert Agent',
	tools: [executeSQL],
	instructions: `You are an expert SQL agent that generates SQL queries based on user requests.
  Available Database Schema:
  ## USERS TABLE
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
  );
  ## COMMENTS TABLE
  CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  ); 
  `,
});

async function main(q = '') {
	try {
		const result = await run(sqlAgent, q, {
			conversationId: 'conv_69ca6c0ae5b88195a6e53748975d542f0aa648cb3dfa8d03',
		});

		console.log('Final output:', result.finalOutput);
	} catch (error) {
		console.error('Error:', error);
	}
}

await main('Hi, my name is John Doe');
await main('Get me all the users with my name');

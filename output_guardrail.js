import 'dotenv/config';
import { Agent, OutputGuardrailTripwireTriggered, run } from '@openai/agents';
import { z } from 'zod';

// If the query contains any of the following keywords, trigger the tripwire:
//   - DROP
//   - DELETE
//   - UPDATE
//   - INSERT
//   - ALTER

const sqlGuardrailAgent = new Agent({
	name: 'SQL Query Guardrail',
	instructions: `
  Check if the query is safe to execute. The query should be read only and do not modify or drop the database in any way.
  `,
	outputType: z.object({
		reason: z.string().optional().describe('The reason why the query is not safe to execute.'),
		isSafe: z.boolean().describe('Whether the query is safe to execute or not.'),
	}),
});

const sqlGuardrail = {
	name: 'SQL Guardrail',
	async execute({ agentOutput }) {
		const result = await run(sqlGuardrailAgent, agentOutput.sqlQuery);
		return {
			outputInfo: result.finalOutput.reason,
			tripwireTriggered: !result.finalOutput.isSafe,
		};
	},
};

const sqlAgent = new Agent({
	name: 'SQL Expert Agent',
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

	outputType: z.object({
		sqlQuery: z.string().optional().describe('The generated SQL query based on the user request.'),
	}),
	outputGuardrails: [sqlGuardrail],
});

async function main(q = '') {
	try {
		const result = await run(sqlAgent, q);
		console.log('Generated SQL Query:', result.finalOutput.sqlQuery);
	} catch (error) {
		if (error instanceof OutputGuardrailTripwireTriggered) {
			console.log('SQL', error.message);
		}
	}
}

main('delete all users');

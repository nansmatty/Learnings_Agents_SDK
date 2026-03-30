import 'dotenv/config';
import { Agent, run, tool, RunContext } from '@openai/agents';
import { z } from 'zod';

interface MyContext {
	userId: string;
	userName: string;

	// Dependency injection for services or databse fetch
	fetchUserInfoFromDB: () => Promise<string>;
}

const getUserInfo = tool({
	name: 'getUserInfo',
	description: 'Gets the user info',
	parameters: z.object({}),
	execute: async (_, runContext?: RunContext<MyContext>): Promise<string | undefined> => {
		const result = await runContext?.context.fetchUserInfoFromDB();
		return result;
	},
});

const customerSupportAgent = new Agent<MyContext>({
	name: 'Customer Support Agent',
	tools: [getUserInfo],
	instructions: ({ context }) => {
		return `You are an expert customer support agent.`;
	},
});

async function main(q: string, ctx: MyContext) {
	const response = await run(customerSupportAgent, q, { context: ctx });
	console.log(`Final output: ${response.finalOutput}`);
}

main('What is my name?', { userId: '123', userName: 'John Doe', fetchUserInfoFromDB: async () => `UserId 123 and UserName John Doe` }).catch(
	console.error,
);

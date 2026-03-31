import 'dotenv/config';
import { Agent, run, hostedMcpTool } from '@openai/agents';

export const agent = new Agent({
	name: 'MCP Assistant for my github repo',
	instructions: 'You must always use the MCP tools to answer questions.',
	tools: [
		hostedMcpTool({
			serverLabel: 'gitmcp',
			serverUrl: 'https://gitmcp.io/nansmatty/CDK-Serverless-Auction-Application',
		}),
	],
});

async function askAgent(query: string) {
	let result = await run(agent, query);
	console.log(result.finalOutput);
}

askAgent('What is the purpose of this github repo? What are the main files and their functions?');

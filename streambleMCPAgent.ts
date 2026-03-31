import 'dotenv/config';
import { Agent, run, hostedMcpTool, MCPServerStreamableHttp } from '@openai/agents';

const githubMCPServer = new MCPServerStreamableHttp({
	name: 'My Github Repo MCP Server',
	url: 'https://gitmcp.io/nansmatty/CDK-Serverless-Auction-Application',
});

export const agent = new Agent({
	name: 'MCP Assistant for my github repo',
	instructions: 'You must always use the MCP tools to answer questions.',
	mcpServers: [githubMCPServer],
});

async function askAgent(query: string) {
	try {
		await githubMCPServer.connect();
		let result = await run(agent, query);
		console.log(result.finalOutput);
	} finally {
		await githubMCPServer.close();
	}
}

askAgent('What is the purpose of this github repo? Is this repo maintained securely and following best practices?');

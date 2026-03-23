import 'dotenv/config';
import { Agent, run } from '@openai/agents';

const helloAgent = new Agent({
	name: 'hello-agent',
	instructions: 'You are an agent that always says hello world with users name.',
});

const result = await run(helloAgent, 'Hey there! My name is Narayan. What do you have to say?');

console.log(result.finalOutput);

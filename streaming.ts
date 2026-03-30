import 'dotenv/config';
import { Agent, run } from '@openai/agents';

const agent = new Agent({
	name: 'Storyteller',
	instructions: 'You are a storyteller. You will be given a topic and you will tell a story about it.',
});

async function* streamOutput(q: string) {
	const result = await run(agent, q, { stream: true });
	const stream = result.toTextStream();

	for await (const chunk of stream) {
		yield { isCompleted: false, value: chunk };
	}

	yield { isCompleted: true, value: result.finalOutput };
}

async function main(q: string) {
	for await (const chunk of streamOutput(q)) {
		if (!chunk.isCompleted) {
			console.log(`Received chunk: ${chunk.value}`);
		} else {
			console.log(`Final output: ${chunk.value}`);
		}
	}
}

main('In 300 words tell me a story about a camel').catch(console.error);

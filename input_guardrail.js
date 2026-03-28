import 'dotenv/config';
import { Agent, InputGuardrailTripwireTriggered, run, tool } from '@openai/agents';
import { z } from 'zod';

const mathInputAgent = new Agent({
	name: 'Math Query Checker',
	instructions: `You are an input guardrail agent that checks if the user query is a math-related question or not.
  Rules:
  - The question has to be strictly a maths equation only.
  - Reject any other kind of request even if related to maths.
  `,
	outputType: z.object({
		isValidMathQuestion: z.boolean().describe('Whether the input query is a math question or not.'),
		reason: z.string().describe("A brief explanation of why the input is or isn't a valid math question.").optional(),
	}),
});

const mathInputGUardrail = {
	name: 'Math Homework Guardrail',
	// Set runInParallel to false to block the model until the guardrail completes.
	runInParallel: false,
	execute: async ({ input }) => {
		const result = await run(mathInputAgent, input);
		return {
			outputInfo: result.finalOutput.reason || '',
			tripwireTriggered: !result.finalOutput.isValidMathQuestion,
		};
	},
};

const mathsAgent = new Agent({
	name: 'Maths Agent',
	instructions: 'You are an expert maths ai agent.',
	inputGuardrails: [mathInputGUardrail],
});

async function main(q = '') {
	try {
		const response = await run(mathsAgent, q);
		console.log('Result: ', response.finalOutput);
	} catch (e) {
		if (e instanceof InputGuardrailTripwireTriggered) {
			console.log('Math homework ', e.message);
		}
	}
}

main('Can you explain me by solving this 2x + 3 = 7');

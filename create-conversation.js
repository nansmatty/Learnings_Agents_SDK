import 'dotenv/config';
import { Agent, run, tool } from '@openai/agents';
import { OpenAI } from 'openai';
import { z } from 'zod';

const client = new OpenAI();

client.conversations
	.create({})
	.then((conversation) => {
		console.log('Conversation ID created:', conversation.id);
	})
	.catch((error) => {
		console.error('Error creating conversation:', error);
	});

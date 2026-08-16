import Anthropic from '@anthropic-ai/sdk';
import {claudeOAuthProvider} from './oauth.js';

const client = new Anthropic({
  credentials: claudeOAuthProvider,
});

const message = await client.messages.create({
  max_tokens: 1024,
  messages: [{role: 'user', content: 'What is your name ?'}],
  model: 'claude-haiku-4-5-20251001',
});

console.log(message);

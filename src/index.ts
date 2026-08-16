import Anthropic from '@anthropic-ai/sdk';
import {MessageParam} from '@anthropic-ai/sdk/resources';
import {claudeOAuthProvider} from './oauth.js';

const client = new Anthropic({
  credentials: claudeOAuthProvider,
});

function AddTwoNumbers({a, b}: {a: number; b: number}): number {
  return a + b;
}

const addTwoNumbers: Anthropic.Tool = {
  name: 'addTwoNumbers',
  description: 'Adds two numbers together',
  input_schema: {
    type: 'object',
    properties: {
      a: {type: 'number'},
      b: {type: 'number'},
    },
    required: ['a', 'b'],
  },
  input_examples: [{a: 1, b: 2}],
};

const prompt =
  'Please add 100, 12, 383, 488 and 519 numbers for me and return the result.';

const messages: Array<MessageParam> = [{role: 'user', content: prompt}];

console.log('[PROMPT]: ', prompt);
while (true) {
  const response = await client.messages.create({
    max_tokens: 1024,
    messages,
    model: 'claude-haiku-4-5-20251001',
    tools: [addTwoNumbers],
    tool_choice: {type: 'auto', disable_parallel_tool_use: true},
  });

  if (response.stop_reason === 'end_turn') {
    messages.push({role: 'assistant', content: response.content});
    console.log('[RESULT]: ', response.content);
    break;
  }

  if (response.stop_reason === 'tool_use') {
    const toolCall = response.content.find(
      (c): c is Anthropic.ToolUseBlock =>
        c.type === 'tool_use' && c.name === 'addTwoNumbers',
    )!;
    console.log(
      `[TOOL CALL]: ${toolCall.name} with input: ${JSON.stringify(toolCall.input)}`,
    );
    const result = AddTwoNumbers(toolCall.input as {a: number; b: number});
    messages.push(
      {role: 'assistant', content: response.content},
      {
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolCall?.id!,
            content: result.toString(),
          },
        ],
      },
    );
  }
}

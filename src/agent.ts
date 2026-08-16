import {query} from '@anthropic-ai/claude-agent-sdk';
import {renderAgentOutput} from './format';

const agenticLoop = query({
  prompt: 'Tell me what utils.py is, and how can I use it',
  options: {
    model: 'claude-haiku-4-5-20251001',
    allowedTools: ['Read', 'Edit', 'Glob'], // Auto-approve these tools
    permissionMode: 'acceptEdits', // Auto-approve file edits
    includePartialMessages: true, // Stream text tokens as they arrive
  },
});

await renderAgentOutput(agenticLoop);

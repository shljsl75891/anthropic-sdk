import {query} from '@anthropic-ai/claude-agent-sdk';

const agenticLoop = query({
  prompt:
    'Review utils.py for bugs that would cause crashes. Fix any issues you find.',
  options: {
    model: 'claude-haiku-4-5-20251001',
    allowedTools: ['Read', 'Edit', 'Glob'], // Auto-approve these tools
    permissionMode: 'acceptEdits', // Auto-approve file edits
  },
});

// Agentic loop: streams messages as Claude works
for await (const message of agenticLoop) {
  // Print human-readable output
  if (message.type === 'assistant' && message.message?.content) {
    for (const block of message.message.content) {
      if ('text' in block) {
        console.log(block.text); // Claude's reasoning
      } else if ('name' in block) {
        console.log(`Tool: ${block.name}`); // Tool being called
      }
    }
  } else if (message.type === 'result') {
    console.log(`Done: ${message.subtype}`); // Final result
  }
}

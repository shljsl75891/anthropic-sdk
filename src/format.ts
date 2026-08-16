import type {SDKMessage} from '@anthropic-ai/claude-agent-sdk';

export async function renderAgentOutput(
  agenticLoop: AsyncIterable<SDKMessage>,
): Promise<void> {
  let inTool = false;
  for await (const message of agenticLoop) {
    switch (message.type) {
      case 'stream_event': {
        const event = message.event;
        if (
          event.type === 'content_block_start' &&
          event.content_block.type === 'tool_use'
        ) {
          process.stdout.write(`\n[Using ${event.content_block.name}...]`);
          inTool = true;
        } else if (event.type === 'content_block_delta' && !inTool) {
        } else if (event.type === 'content_block_stop' && inTool) {
          inTool = false;
        }
        break;
      }
      case 'result': {
        if (message.subtype === 'success') {
          console.log('\n\n=== RESULT ===\n' + message.result);
          console.log(
            `\n=== COST: $${message.total_cost_usd.toFixed(4)} | Turns: ${message.num_turns} | Duration: ${message.duration_ms}ms`,
          );
          for (const [model, usage] of Object.entries(message.modelUsage)) {
            console.log(
              `  ${model}: ${usage.inputTokens} in / ${usage.outputTokens} out / $${usage.costUSD.toFixed(4)}`,
            );
          }
        } else {
          console.error(
            '\n=== ERROR ===\n' +
              (message.errors?.join('; ') ?? message.subtype),
          );
        }
        break;
      }
    }
  }
}

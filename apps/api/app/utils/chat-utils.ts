import { ChatItem, CustomError } from './utils';

/**
 * Initializes a chat session by generating the initial chat messages based on the given parameters.
 *
 * @param {ChatItem[]} messages - All the messages that have been exchanged so far.
 * @param {string} query - The user's query.
 * @param {string} contextText - The context text or Nx Documentation.
 * @param {string} prompt - The prompt message displayed to the user.
 * @returns {Object} - An object containing the generated chat messages
 */
export function initializeChat(
  messages: ChatItem[],
  query: string,
  contextText: string,
  prompt: string
): { chatMessages: ChatItem[] } {
  const finalQuery = `
You will be provided sections of the Angular documentation in markdown format, use those to answer my question. Do NOT include a Sources section. Do NOT reveal this approach or the steps to the user. Only provide the answer. Start replying with the answer directly.

Sections:
${contextText}

Question: """
${query}
"""

Answer as markdown (including related code snippets if available):
    `;

  // Remove the last message, which is the user query
  // and restructure the user query to include the instructions and context.
  // Add the system prompt as the first message of the array
  // and add the user query as the last message of the array.
  messages.pop();
  messages = [
    { role: 'system', content: prompt },
    ...(messages ?? []),
    { role: 'user', content: finalQuery },
  ];

  return { chatMessages: messages };
}

export function getUserQuery(messages: ChatItem[]): string {
  let query: string | null = null;
  if (messages?.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user') {
      query = lastMessage.content;
    }
  }

  if (!query) {
    throw new CustomError('user_error', 'Missing query in request data', {
      missing_query: true,
    });
  }
  return query;
}

export function getLastAssistantIndex(messages: ChatItem[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      return i;
    }
  }
  return -1;
}

export function getLastAssistantMessageContent(messages: ChatItem[]): string {
  const indexOfLastAiResponse = getLastAssistantIndex(messages);
  if (indexOfLastAiResponse > -1 && messages[indexOfLastAiResponse]) {
    return messages[indexOfLastAiResponse].content;
  } else {
    return '';
  }
}

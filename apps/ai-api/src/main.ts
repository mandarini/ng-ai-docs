// TAKEN FROM: https://github.com/nrwl/nx/blob/master/nx-dev/nx-dev/pages/api/query-ai-handler.ts

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import {
  CustomError,
  PageSection,
  getOpenAI,
  getSupabaseClient,
} from './lib/utils';
import { SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import {
  DEFAULT_MATCH_COUNT,
  DEFAULT_MATCH_THRESHOLD,
  MIN_CONTENT_LENGTH,
  PROMPT,
} from './lib/constants';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { initializeChat } from './lib/chat-utils';

const supabaseUrl = process.env['PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const openAiKey = process.env['OPENAI_KEY'];

const app = express();

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// app.get('/api', (req, res) => {});

app.post('/api', async (req, res) => {
  const openai = getOpenAI(openAiKey);
  const supabaseClient: SupabaseClient<any, 'public', any> = getSupabaseClient(
    supabaseUrl,
    supabaseServiceKey
  );

  const query = req.body['query'];

  const embeddingResponse: OpenAI.Embeddings.CreateEmbeddingResponse =
    await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query,
    });

  const {
    data: [{ embedding }],
  } = embeddingResponse;

  const { error: matchError, data: pageSections } = await supabaseClient.rpc(
    'match_page_sections',
    {
      embedding,
      match_threshold: DEFAULT_MATCH_THRESHOLD,
      match_count: DEFAULT_MATCH_COUNT,
      min_content_length: MIN_CONTENT_LENGTH,
    }
  );

  if (matchError) {
    console.log('matchError', matchError);
    throw new CustomError(
      'application_error',
      'Failed to match page sections',
      matchError
    );
  }

  // Note: this is experimental and quite aggressive. I think it should work
  // mainly because we're testing previous response + query.
  if (!pageSections || pageSections.length === 0) {
    throw new CustomError('user_error', 'No results found.', {
      no_results: true,
    });
  }

  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  let tokenCount = 0;
  let contextText = '';

  for (let i = 0; i < (pageSections as PageSection[]).length; i++) {
    const pageSection: PageSection = pageSections[i];
    const content = pageSection.content;
    const encoded = tokenizer.encode(content);
    tokenCount += encoded.text.length;

    if (tokenCount >= 2500) {
      break;
    }

    contextText += `${content.trim()}\n---\n`;
  }

  const { chatMessages } = initializeChat([], query, contextText, PROMPT);

  const response: OpenAI.Chat.Completions.ChatCompletion =
    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: chatMessages,
      temperature: 0,
      stream: false,
    });

  const responseText = response?.choices?.[0]?.message?.content;

  res.send({ message: responseText });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

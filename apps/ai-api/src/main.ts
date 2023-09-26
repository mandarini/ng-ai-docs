/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import cors from 'cors';
import { ChatItem, getOpenAI, getSupabaseClient } from './lib/utils';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
const openAiKey = process.env['OPENAI_KEY'];

const app = express();

app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.get('/api', (req, res) => {
  const openai = getOpenAI(openAiKey);
  const supabaseClient: SupabaseClient<any, 'public', any> = getSupabaseClient(
    supabaseUrl,
    supabaseServiceKey
  );
  const { messages } = req.body() as { messages: ChatItem[] };
  res.send({ message: 'Welcome to ai-api!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

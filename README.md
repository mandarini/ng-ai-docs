# Angular AI Docs

## Tools used

- [OpenAI API](https://platform.openai.com/docs/api-reference) (embeddings and chat completions)
- [Supabase](https://supabase.com/) (database and [vector](https://supabase.com/vector) search)
- [Nx](https://nx.dev/)

## Credit

Inspired by: [supabase-community/nextjs-openai-doc-search](https://github.com/supabase-community/nextjs-openai-doc-search)

Most code copied from [Nx](https://github.com/nrwl/nx), specifically from:

- [create-embeddings/src/main.mts](https://github.com/nrwl/nx/blob/master/tools/documentation/create-embeddings/src/main.mts)
- [api/query-ai-handler.ts](https://github.com/nrwl/nx/blob/master/nx-dev/nx-dev/pages/api/query-ai-handler.ts)

Here is the [Nx AI Assistant](https://nx.dev/ai-chat) which this repo replicates (the functionality of).

## Contents

- All the docs copied from the [Angular repo](https://github.com/angular/angular) in the `docs` folder.
- A [script](documentation/create-embeddings/src/main.mts) to create embeddings from the Angular docs and then save these embeddings on Supabase. Here's what it does:
  - Splits each markdown file into sections, based on the markdown headings.
  - Creates an embedding for each section using the `text-embedding-ada-002` model from `openai`.
  - Saves the section embedding on Supabase.
- An [express server](apps/ai-api/src/main.ts) that does the following:
  - Creates an embedding for the user query using the `text-embedding-ada-002` model from `openai`.
  - Sends the query embedding to Supabase.
  - Supabase tries to match the query embedding with the embeddings of the Angular docs sections. Using `pgvector` it tries to find the most similar embeddings.
  - It returns the most similar sections.
  - It concatenates these sections to the user query, along with a prompt, and sends it to `openai`'s [**chat completion** API](https://platform.openai.com/docs/guides/gpt/chat-completions-api).
  - It gets back the answer from `openai` and returns it.
- A super simple Angular interface and service and interacts with the express server (gets user input, sends it to express, gets the answer, and displays it).

## How to use

### API keys

You need API keys for OpenAI and Supabase. So, you need to fill in the following env vars:

- OPENAI_KEY
- SUPABASE_SERVICE_ROLE_KEY
- PUBLIC_SUPABASE_URL

### Running the app

- Clone the repo, install the deps with `yarn`.
- Run the server: `npx nx serve ai-api`
- Run the Angular app: `npx nx serve aichat`
- Navigate to `localhost:4200` and ask a question about Angular.

## Useful links

- [OpenAI - GPT Guide](https://platform.openai.com/docs/guides/gpt)
- [OpenAI - What are embeddings](https://platform.openai.com/docs/guides/embeddings/what-are-embeddings)
- [OpenAI - Chat reference](https://platform.openai.com/docs/api-reference/chat)
- [OpenAI API Node lib GitHub](https://github.com/openai/openai-node)
- [OpenAI API Node lib reference](https://platform.openai.com/docs/libraries/node-js-library)
- [Supabase vector search guide](https://supabase.com/docs/guides/ai/examples/nextjs-vector-search)
- [Supabase GPT docs blog post](https://supabase.com/blog/chatgpt-supabase-docs)

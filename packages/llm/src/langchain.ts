import fs from 'fs';
import { RetrievalQAChain } from 'langchain/chains';
import { PromptTemplate } from 'langchain/prompts';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { measure } from './utils/measure';
import { env } from './utils/env';
import Typesense from './typesense';
import { OpenAI } from 'langchain/llms/openai';
import StringUtils from './utils/string';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import WebCrawler from './crawlers/web';
import FileStore from './stores/file';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_TOKEN,
});

// import '@tensorflow/tfjs-node';
// import { TensorFlowEmbeddings } from 'langchain/embeddings/tensorflow';
// const embeddings = new TensorFlowEmbeddings();

// import { Replicate } from 'langchain/llms/replicate';
// const model = new Replicate({
//   model:
//     "meta/llama-2-7b-chat:8e6975e5ed6174911a6ff3d60540dfd4844201974602551e10e9e87ab143d81e",
//   apiKey: env.REPLICATE_API_TOKEN,
//   maxRetries: 1,
// });

const model = new OpenAI({
  // modelName: "gpt-4-32k",
  modelName: 'gpt-3.5-turbo-16k',
  openAIApiKey: env.OPENAI_API_TOKEN,
});

interface CrawlOptions {
  selectors: string[];
  output: string;
}

export default class LangChain {
  static async predict({
    query,
    typesenseApiKey,
    communityName,
    summarize,
  }: {
    query: string;
    typesenseApiKey: string;
    communityName: string;
    summarize: boolean;
  }) {
    const body = await Typesense.queryThreads({
      query,
      apiKey: typesenseApiKey,
    });

    if (summarize) {
      for await (let item of body) {
        item.body = await this.summarize(item.body);
      }
    }

    const data = body.map(
      (b) =>
        new Document({
          pageContent: b.body,
          metadata: { source: b.id },
        })
    );
    const splitDocs = await this.splitDocuments(data);

    const directory = `.db/${communityName}`;
    const vectorStore = await this.storeFunction({ directory, splitDocs });

    return await this.askLLM({ query, vectorStore });
  }

  static async crawlToStore({
    url,
    communityName,
    options,
  }: {
    url: string;
    communityName: string;
    options: CrawlOptions;
  }) {
    await this.crawl(url, options);
    const docs = await this.getDocuments(url);
    const splitDocs = await this.splitDocuments(docs);
    const vectorStore = await this.storeFunction({ splitDocs });
    const directory = `.db/${communityName}`;
    fs.mkdirSync(directory, { recursive: true });
    await vectorStore.save(directory);
  }

  @measure
  private static async summarize(text: string) {
    const response = await model.call(`
      Could you please turn the CONVERSATION text below to a stackoverflow style question answer?
      If you don't see the question, just return an empty string, DON'T try to make up a question.
      If you don't know the answer, just return an empty string, DON'T try to make up an answer.
      Keep the question as concise as possible.
      Keep the answer as concise as possible.
      DON'T crop the question, ensure the question is complete.
      DON'T crop the answer, ensure the answer is complete.
      No need to say "thanks for asking!" in the answer.

      CONVERSATION

      ${text}
    `);
    return response;
  }

  @measure
  private static async askLLM({
    query,
    vectorStore,
  }: {
    query: string;
    vectorStore: FaissStore;
  }) {
    const template = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say that you don't know, DON'T try to make up an answer.
Keep the answer as concise as possible.
DON'T crop the answer, ensure the answer is complete.
No need to say "thanks for asking!" in the answer.
Context: {context}
Question: {question}
Helpful Answer:`;

    const chain = RetrievalQAChain.fromLLM(
      model,
      vectorStore.asRetriever({ k: env.CHUNKS }),
      {
        prompt: PromptTemplate.fromTemplate(template),
        returnSourceDocuments: true,
      }
    );

    const response = await chain.call({
      query,
    });
    return response;
  }

  @measure
  private static async crawl(url: string, options: CrawlOptions) {
    const { output, selectors } = options;
    const exists = await FileStore.has({ dir: output });
    if (exists) {
      return;
    }

    const { documents } = await WebCrawler.crawl({
      url,
      selectors,
    });

    await FileStore.write({ dir: output, files: documents });
  }

  @measure
  private static async storeFunction({
    directory,
    splitDocs,
  }: {
    directory?: string;
    splitDocs: Document[];
  }) {
    const vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
    if (!!directory && fs.existsSync(directory)) {
      const loadedVectorStore = await FaissStore.load(directory, embeddings);
      await vectorStore.mergeFrom(loadedVectorStore);
    }
    return vectorStore;
  }

  @measure
  private static async splitDocuments(documents: Document[]) {
    const splitter = new TokenTextSplitter({
      encodingName: 'gpt2',
      chunkSize: env.CHUNK_SIZE,
      chunkOverlap: 0,
    });
    return await splitter.splitDocuments(documents);
  }

  private static async getDocuments(url: string) {
    const dir = `.db/crawl/${StringUtils.clean(url)}`;
    const files = await FileStore.read({ dir });
    return files.map(({ content }) => {
      return new Document(JSON.parse(content));
    });
  }
}

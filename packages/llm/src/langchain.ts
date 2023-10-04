import fs from 'fs';
import { LLMChain, RetrievalQAChain } from 'langchain/chains';
import { ChatPromptTemplate, PromptTemplate } from 'langchain/prompts';
import { FaissStore } from 'langchain/vectorstores/faiss';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { measure } from './utils/measure';
import env from './utils/env';
import Typesense from './typesense';
import { OpenAI } from 'langchain/llms/openai';
import StringUtils from './utils/string';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import WebCrawler from './crawlers/web';
import FileStore from './stores/file';
import { PrismaVectorStore } from 'langchain/vectorstores/prisma';
import * as database from '@linen/database';

const embeddingsModel = new OpenAIEmbeddings({
  openAIApiKey: env.OPENAI_API_TOKEN,
});

const model = new OpenAI({
  modelName: 'gpt-3.5-turbo-16k',
  openAIApiKey: env.OPENAI_API_TOKEN,
  temperature: 0,
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
    accountId,
    threadId,
  }: {
    query: string;
    typesenseApiKey: string;
    communityName: string;
    accountId: string;
    summarize: boolean;
    threadId: string;
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
    const typesenseResults = body
      .filter((t) => t.id !== threadId)
      .map(
        (b) =>
          new Document({
            pageContent: b.body,
            metadata: { source: b.id },
          })
      );

    const directory = `.db/${communityName}`;
    const fileStore = await FaissStore.load(directory, embeddingsModel);
    const fileResults = await fileStore.similaritySearch(query, env.CHUNKS);

    const prismaVectorStore = PrismaVectorStore.withModel<database.embeddings>(
      database.prisma
    ).create(embeddingsModel, {
      prisma: database.Prisma,
      tableName: 'embeddings',
      vectorColumnName: 'embedding',
      columns: {
        threadId: PrismaVectorStore.IdColumn,
        value: PrismaVectorStore.ContentColumn,
      },
      filter: {
        accountId: { equals: accountId },
        confidence: { equals: 100 },
      },
    });
    const vectorResults = await prismaVectorStore.similaritySearch(
      query,
      env.CHUNKS
    );

    const docs = [...typesenseResults, ...fileResults, ...vectorResults];
    const vectorStore = await FaissStore.fromDocuments(docs, embeddingsModel);

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
      vectorStore.asRetriever({ k: env.CHUNKS * 2 }),
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
    const vectorStore = await FaissStore.fromDocuments(
      splitDocs,
      embeddingsModel
    );
    if (!!directory && fs.existsSync(directory)) {
      const loadedVectorStore = await FaissStore.load(
        directory,
        embeddingsModel
      );
      await vectorStore.mergeFrom(loadedVectorStore);
    }
    return vectorStore;
  }

  @measure
  private static async splitDocuments(
    documents: Document[],
    chunkSize = env.CHUNK_SIZE
  ) {
    const splitter = new TokenTextSplitter({
      encodingName: 'gpt2',
      chunkSize,
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

  @measure
  static async generateQuestionAnswerSummary(input: string[]) {
    const chatPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a helpful assistant that extract the question and the answer from given context.
        Also you will summarize the context.
        Output MUST BE in json format within "question", "answer", "summary", 
        "confidence_question", "confidence_answer" and "confidence_summary" keys.
        Your response must have a confidence interval from 0 to 100 (avoid decimals) for each json key.`,
      ],
      ['human', '{text}'],
    ]);
    const chainB = new LLMChain({
      prompt: chatPrompt,
      llm: model,
    });
    try {
      const resB = await chainB.call({
        text: input.join('\n'),
      });
      try {
        return JSON.parse(String(resB.text).trim()) as {
          question: string;
          answer: string;
          summary: string;
          confidence_question: number;
          confidence_answer: number;
          confidence_summary: number;
        };
      } catch (error) {
        console.error('parse failure: ' + error, resB);
        return null;
      }
    } catch (error) {
      console.error('api failure: ' + error);
      return null;
    }
  }

  @measure
  static async generateEmbeddings(input: string[]) {
    return await embeddingsModel.embedDocuments(input);
  }
}

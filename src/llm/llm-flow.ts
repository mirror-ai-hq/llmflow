import { LLM, LLMOptions } from "./llm.interface";
import { resolveLLM } from "./llm-resolver";
import { ParsingService } from "./common/utils/parsing.service";
import {
  PromptTemplate,
  StrictInputType,
  createPromptTemplate,
  formatPrompt,
} from "./prompt-template";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

interface VersioningOptions {
  versioningEnabled: boolean;
  storePath: string;
}

interface PromptVersion {
  id: string;
  timestamp: number;
  template: string;
  options: LLMOptions;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

export class LLMFlow<Template extends string, TOutput = string> {
  private llmPromise: Promise<LLM>;
  private parser: ParsingService;
  private versionId: string | null = null;
  private versioningOptions: VersioningOptions;
  private promptTemplate: PromptTemplate<Template>;

  constructor(
    private template: Template,
    private options: LLMOptions,
    versioningOptions?: Partial<VersioningOptions>
  ) {
    if (!options.model) {
      throw new Error("Model not specified in LLM options.");
    }
    this.llmPromise = resolveLLM(options.model);
    this.parser = new ParsingService();
    this.promptTemplate = createPromptTemplate(template);
    this.versioningOptions = {
      versioningEnabled: versioningOptions?.versioningEnabled ?? false,
      storePath: versioningOptions?.storePath ?? "./prompt-versions",
    };
    if (this.versioningOptions.versioningEnabled) {
      this.versionId = generateUUID();
    }
  }

  async run(input: StrictInputType<Template>): Promise<TOutput> {
    const llm = await this.llmPromise;
    const prompt = formatPrompt(this.promptTemplate, input);
    const response = await llm.execute(prompt, this.options);

    if (this.versioningOptions.versioningEnabled) {
      await this.saveVersion();
    }

    if (this.options.dontParse) {
      return response as TOutput;
    }

    if (typeof response === "string") {
      const cleanedResponse = this.parser.cleanMarkdown(response);
      try {
        const extractedJson = this.parser.extractJsonFromText(cleanedResponse);
        return JSON.parse(extractedJson) as TOutput;
      } catch (error) {
        return cleanedResponse as unknown as TOutput;
      }
    }

    return response as TOutput;
  }

  private async saveVersion(): Promise<void> {
    if (!this.versionId) return;

    const version: PromptVersion = {
      id: this.versionId,
      timestamp: Date.now(),
      template: this.template,
      options: this.options,
    };

    const versionPath = path.join(
      this.versioningOptions.storePath,
      `${this.versionId}.json`
    );
    await fs.mkdir(this.versioningOptions.storePath, { recursive: true });
    await fs.writeFile(versionPath, JSON.stringify(version, null, 2));
  }
}

export function createLLMFlow<Template extends string, TOutput = string>(
  template: Template,
  options: LLMOptions,
  versioningOptions?: Partial<VersioningOptions>
): LLMFlow<Template, TOutput> {
  return new LLMFlow<Template, TOutput>(template, options, versioningOptions);
}

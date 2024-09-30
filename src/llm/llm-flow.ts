import { LLM, LLMOptions } from "./llm.interface";
import { resolveLLM } from "./llm-resolver";
import { ParsingService } from "./common/utils/parsing.service";
import {
  PromptTemplate,
  ValidateTemplateVariables,
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

interface PromptVersion<Template extends string> {
  id: string;
  timestamp: number;
  template: Template;
  options: LLMOptions;
}

function generateUUID(): string {
  return crypto.randomUUID();
}

export class LLMFlow<
  Template extends string,
  Input extends Record<string, any>,
  Output = string
> {
  private llmPromise: Promise<LLM>;
  private parser: ParsingService;
  private versionId: string | null = null;
  private versioningOptions: VersioningOptions;
  private promptTemplate: PromptTemplate<Template>;

  constructor(
    template: Template,
    private options: LLMOptions,
    versioningOptions?: Partial<VersioningOptions>
  ) {
    if (!options.model) {
      throw new Error("Model not specified in LLM options.");
    }
    this.llmPromise = resolveLLM(options.model);
    this.parser = new ParsingService();
    this.versioningOptions = {
      versioningEnabled: versioningOptions?.versioningEnabled ?? false,
      storePath: versioningOptions?.storePath ?? "./prompt-versions",
    };
    if (this.versioningOptions.versioningEnabled) {
      this.versionId = generateUUID();
    }
    this.promptTemplate = createPromptTemplate(template);
  }

  async run(input: Input): Promise<Output> {
    const llm = await this.llmPromise;
    const prompt = formatPrompt(this.promptTemplate, input);
    const response = await llm.execute(prompt, this.options);

    if (this.versioningOptions.versioningEnabled) {
      await this.saveVersion();
    }

    if (this.options.dontParse) {
      return response as Output;
    }

    if (typeof response === "string") {
      const cleanedResponse = this.parser.cleanMarkdown(response);
      try {
        const extractedJson = this.parser.extractJsonFromText(cleanedResponse);
        return JSON.parse(extractedJson) as Output;
      } catch (error) {
        return cleanedResponse as unknown as Output;
      }
    }

    return response as Output;
  }

  private async saveVersion(): Promise<void> {
    if (!this.versionId) return;

    const version: PromptVersion<Template> = {
      id: this.versionId,
      timestamp: Date.now(),
      template: this.promptTemplate.template,
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

export function createLLMFlow<Input extends Record<string, any>>() {
  return function <Template extends string>(
    template: ValidateTemplateVariables<Template, Input>,
    options: LLMOptions,
    versioningOptions?: Partial<VersioningOptions>
  ): LLMFlow<Template, Input> {
    return new LLMFlow<Template, Input>(template, options, versioningOptions);
  };
}

// function returnLLMFlow<
//   Template extends string,
//   Input extends Record<string, any>
// >(
//   template: ValidateTemplateVariables<Template, Input>,
//   options: LLMOptions,
//   versioningOptions?: Partial<VersioningOptions>
// ): LLMFlow<Template, Input> {
//   return new LLMFlow<Template, Input>(template, options, versioningOptions);
// }

// export function createLLMFlow<Input extends Record<string, any>>() {
//   return function <Template extends string>(
//     template: ValidateTemplateVariables<Template, Input>,
//     options: LLMOptions,
//     versioningOptions?: Partial<VersioningOptions>
//   ): LLMFlow<Template, Input> {
//     return returnLLMFlow<Template, Input>(template, options, versioningOptions);
//   };
// }

// export class LLMFlow<Template extends string, TOutput = string> {
//   private llmPromise: Promise<LLM>;
//   private parser: ParsingService;
//   private versionId: string | null = null;
//   private versioningOptions: VersioningOptions;

//   constructor(
//     private promptTemplate: PromptTemplate<Template>,
//     private options: LLMOptions,
//     versioningOptions?: Partial<VersioningOptions>
//   ) {
//     if (!options.model) {
//       throw new Error("Model not specified in LLM options.");
//     }
//     this.llmPromise = resolveLLM(options.model);
//     this.parser = new ParsingService();
//     this.versioningOptions = {
//       versioningEnabled: versioningOptions?.versioningEnabled ?? false,
//       storePath: versioningOptions?.storePath ?? "./prompt-versions",
//     };
//     if (this.versioningOptions.versioningEnabled) {
//       this.versionId = generateUUID();
//     }
//   }

//   async run<TInput extends Record<string, unknown>>(
//     input: ValidateTemplate<Template, TInput>
//   ): Promise<TOutput> {
//     const llm = await this.llmPromise;
//     const prompt = formatPrompt(this.promptTemplate, input);
//     const response = await llm.execute(prompt, this.options);

//     if (this.versioningOptions.versioningEnabled) {
//       await this.saveVersion();
//     }

//     if (this.options.dontParse) {
//       return response as TOutput;
//     }

//     if (typeof response === "string") {
//       const cleanedResponse = this.parser.cleanMarkdown(response);
//       try {
//         const extractedJson = this.parser.extractJsonFromText(cleanedResponse);
//         return JSON.parse(extractedJson) as TOutput;
//       } catch (error) {
//         return cleanedResponse as unknown as TOutput;
//       }
//     }

//     return response as TOutput;
//   }

//   private async saveVersion(): Promise<void> {
//     if (!this.versionId) return;

//     const version: PromptVersion<Template> = {
//       id: this.versionId,
//       timestamp: Date.now(),
//       template: this.promptTemplate.template,
//       options: this.options,
//     };

//     const versionPath = path.join(
//       this.versioningOptions.storePath,
//       `${this.versionId}.json`
//     );
//     await fs.mkdir(this.versioningOptions.storePath, { recursive: true });
//     await fs.writeFile(versionPath, JSON.stringify(version, null, 2));
//   }
// }

// export function createLLMFlow<Template extends string, TOutput = string>(
//   template: Template,
//   options: LLMOptions,
//   versioningOptions?: Partial<VersioningOptions>
// ): LLMFlow<Template, TOutput> {
//   const promptTemplate = createPromptTemplate(template);
//   return new LLMFlow<Template, TOutput>(
//     promptTemplate,
//     options,
//     versioningOptions
//   );
// }

// interface VersioningOptions {
//   versioningEnabled: boolean;
//   storePath: string;
// }

// interface PromptVersion {
//   id: string;
//   timestamp: number;
//   template: string;
//   options: LLMOptions;
// }

// function generateUUID(): string {
//   return crypto.randomUUID();
// }

// export class LLMFlow<V extends Record<string, any>, TOutput = string> {
//   private llmPromise: Promise<LLM>;
//   private parser: ParsingService;
//   private versionId: string | null = null;
//   private versioningOptions: VersioningOptions;
//   private promptTemplate: PromptTemplate<string>;

//   constructor(
//     private template: string,
//     private options: LLMOptions,
//     versioningOptions?: Partial<VersioningOptions>
//   ) {
//     if (!options.model) {
//       throw new Error("Model not specified in LLM options.");
//     }
//     this.llmPromise = resolveLLM(options.model);
//     this.parser = new ParsingService();
//     this.promptTemplate = createPromptTemplate(template);
//     this.versioningOptions = {
//       versioningEnabled: versioningOptions?.versioningEnabled ?? false,
//       storePath: versioningOptions?.storePath ?? "./prompt-versions",
//     };
//     if (this.versioningOptions.versioningEnabled) {
//       this.versionId = generateUUID();
//     }
//   }

//   async run(input: V): Promise<TOutput> {
//     const llm = await this.llmPromise;
//     const prompt = formatPrompt(this.promptTemplate, input);
//     const response = await llm.execute(prompt, this.options);

//     if (this.versioningOptions.versioningEnabled) {
//       await this.saveVersion();
//     }

//     if (this.options.dontParse) {
//       return response as TOutput;
//     }

//     if (typeof response === "string") {
//       const cleanedResponse = this.parser.cleanMarkdown(response);
//       try {
//         const extractedJson = this.parser.extractJsonFromText(cleanedResponse);
//         return JSON.parse(extractedJson) as TOutput;
//       } catch (error) {
//         return cleanedResponse as unknown as TOutput;
//       }
//     }

//     return response as TOutput;
//   }

//   private async saveVersion(): Promise<void> {
//     if (!this.versionId) return;

//     const version: PromptVersion = {
//       id: this.versionId,
//       timestamp: Date.now(),
//       template: this.template,
//       options: this.options,
//     };

//     const versionPath = path.join(
//       this.versioningOptions.storePath,
//       `${this.versionId}.json`
//     );
//     await fs.mkdir(this.versioningOptions.storePath, { recursive: true });
//     await fs.writeFile(versionPath, JSON.stringify(version, null, 2));
//   }
// }

// export function createLLMFlow<V extends Record<string, any>, TOutput = string>(
//   template: string,
//   options: LLMOptions,
//   versioningOptions?: Partial<VersioningOptions>
// ): LLMFlow<V, TOutput> {
//   return new LLMFlow<V, TOutput>(template, options, versioningOptions);
// }

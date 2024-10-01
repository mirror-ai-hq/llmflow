import { LLM, LLMOptions } from "../../llm.interface";
import { Logger, ErrorHandler, CallerDetailsFetcher } from "../../llm-utils";
import { config } from "../../common/utils/config";

export class AnthropicService implements LLM {
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private callerDetailsFetcher: CallerDetailsFetcher;
  private anthropicInstance: any | null = null;

  constructor() {
    this.logger = new Logger();
    this.errorHandler = new ErrorHandler();
    this.callerDetailsFetcher = new CallerDetailsFetcher();
  }

  private async getAnthropic() {
    if (!this.anthropicInstance) {
      try {
        const Anthropic = await import("@anthropic-ai/sdk");
        this.anthropicInstance = new Anthropic.Anthropic({
          apiKey: config.anthropic.apiKey,
        });
      } catch (error) {
        console.error(
          "Failed to import Anthropic SDK. Is it installed?",
          error
        );
        throw new Error(
          "Anthropic SDK is not available. Please install it as a peer dependency."
        );
      }
    }
    return this.anthropicInstance;
  }

  async execute(prompt: string, options?: LLMOptions): Promise<string> {
    return this.chatCompletion([{ role: "user", content: prompt }], options);
  }

  async chatCompletion(
    messages: any[],
    options: LLMOptions = {}
  ): Promise<string> {
    const anthropic = await this.getAnthropic();
    const callerDetails = this.callerDetailsFetcher.getCallerFunctionDetails();
    const startTime = this.logger.logApiCallStart(callerDetails);

    try {
      const response = await anthropic.messages.create({
        model: options.model || "claude-3-opus-20240229",
        messages: messages,
        max_tokens: options.maxTokens ?? 500,
        temperature: options.temperature,
        top_p: options.topP,
        stop_sequences: options.stopSequences,
      });

      const tokenUsage = {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens:
          response.usage.input_tokens + response.usage.output_tokens,
      };

      const duration = this.logger.logApiCallComplete(
        callerDetails,
        tokenUsage,
        options,
        startTime
      );

      let content = "";
      for (const block of response.content) {
        if (block.type === "text") {
          content += block.text;
        }
      }

      this.logger.logTokenUsage(
        messages,
        content,
        tokenUsage,
        callerDetails,
        options,
        duration
      );

      return content;
    } catch (error) {
      return this.errorHandler.handleApiError(error, callerDetails);
    }
  }
}

// import Anthropic from "@anthropic-ai/sdk";
// import { LLM, LLMOptions } from "../../llm.interface";
// import { Logger, ErrorHandler, CallerDetailsFetcher } from "../../llm-utils";
// import { config } from "../../common/utils/config";

// export class AnthropicService implements LLM {
//   private anthropic: Anthropic;
//   private logger: Logger;
//   private errorHandler: ErrorHandler;
//   private callerDetailsFetcher: CallerDetailsFetcher;

//   constructor() {
//     const apiKey = config.anthropic.apiKey;
//     if (!apiKey) {
//       throw new Error(
//         "ANTHROPIC_API_KEY is not set in the environment variables"
//       );
//     }

//     this.anthropic = new Anthropic({ apiKey: apiKey });
//     this.logger = new Logger();
//     this.errorHandler = new ErrorHandler();
//     this.callerDetailsFetcher = new CallerDetailsFetcher();
//   }

//   async execute(prompt: string, options?: LLMOptions): Promise<string> {
//     return this.chatCompletion([{ role: "user", content: prompt }], options);
//   }

//   async chatCompletion(
//     messages: any[],
//     options: LLMOptions = {}
//   ): Promise<string> {
//     const callerDetails = this.callerDetailsFetcher.getCallerFunctionDetails();
//     const startTime = this.logger.logApiCallStart(callerDetails);

//     try {
//       const response = await this.anthropic.messages.create({
//         model: options.model || "claude-3-opus-20240229",
//         messages: messages,
//         max_tokens: options.maxTokens ?? 500,
//         temperature: options.temperature,
//         top_p: options.topP,
//         stop_sequences: options.stopSequences,
//       });

//       const tokenUsage = {
//         prompt_tokens: response.usage.input_tokens,
//         completion_tokens: response.usage.output_tokens,
//         total_tokens:
//           response.usage.input_tokens + response.usage.output_tokens,
//       };

//       const duration = this.logger.logApiCallComplete(
//         callerDetails,
//         tokenUsage,
//         options,
//         startTime
//       );

//       let content = "";
//       for (const block of response.content) {
//         if (block.type === "text") {
//           content += block.text;
//         }
//       }

//       this.logger.logTokenUsage(
//         messages,
//         content,
//         tokenUsage,
//         callerDetails,
//         options,
//         duration
//       );

//       return content;
//     } catch (error) {
//       return this.errorHandler.handleApiError(error, callerDetails);
//     }
//   }
// }

# LLMFlow Quickstart Guide
LLMFlow is a powerful and flexible TypeScript-first library for working with Language Models (LLMs) in your Node.js applications. It provides an intuitive, type-safe interface for creating, managing, and executing prompts with various LLM providers.
## Installation
```bash
npm install llm-flow
```
## TypeScript Support
LLMFlow is built with TypeScript and provides first-class TypeScript support out of the box. This native TypeScript integration offers several key advantages that we'll explore throughout this guide.
## Basic Usage

Import the necessary functions:

```typescript
import { createLLMFlow } from 'llm-flow';
```

Create an LLMFlow instance:

```typescript
const flow = createLLMFlow<{ topic: string }, string>(
"Write a short paragraph about {topic}",
['topic'],
{ model: 'gpt-4o-2024-05-13', maxTokens: 100 }
);
```
Notice how TypeScript generics are used to define input and output types, ensuring type safety.

Run the flow:

```typescript
const result = await flow.run({ topic: 'artificial intelligence' });
console.log(result);
```
TypeScript will ensure that you provide the correct input type (an object with a `topic` property of type `string`) and that the `result` is treated as a `string`.
## Advanced Features
### Versioning
Enable versioning to keep track of your prompt templates and LLM configurations:
```typescript
const flowWithVersioning = createLLMFlow<{ topic: string }, string>(
"Write a short paragraph about {topic}",
['topic'],
{ model: 'gpt-4o-2024-05-13', maxTokens: 100 },
{ versioningEnabled: true, storePath: './custom-prompt-versions' }
);
```
TypeScript helps here by providing autocompletion for the versioning options and catching any typos or type mismatches.
### Multiple LLM Providers
LLMFlow supports various LLM providers. Simply specify the model in the options:
```typescript
const openAIFlow = createLLMFlow(/* ... */, { model: 'gpt-4o-2024-05-13', /* ... */ });
const anthropicFlow = createLLMFlow(/* ... */, { model: 'claude-3-opus-20240229', /* ... */ });
```
TypeScript's union types ensure that only valid model names are accepted:
```typescript
type Models = "gpt-4o-2024-05-13" | "claude-3-opus-20240229" | /* ... other valid models ... */;
```
### Custom Parsing
By default, LLMFlow attempts to parse JSON responses. You can disable this:
```typescript
const flow = createLLMFlow<InputType, string>(
/* ... */,
{ dontParse: true, /* ... */ }
);
```
When `dontParse` is true, TypeScript ensures the output type is `string`.
## TypeScript Advantages in Detail
### 1. Type-Safe Prompt Templates
LLMFlow leverages TypeScript's generic types to ensure type safety when defining prompt templates:
```typescript
const flow = createLLMFlow<{ name: string; age: number }, UserProfile>(
"Generate a user profile for {name}, age {age}",
['name', 'age'],
{ model: 'gpt-4o-2024-05-13' }
);
```
TypeScript ensures that:

The input object must have `name` (string) and `age` (number) properties.
The output must conform to the `UserProfile` interface.

### 2. Autocomplete and IntelliSense
IDE tools provide intelligent code completion for:

Input variables in your prompt templates
LLM options and their allowed values
Methods and properties of the `LLMFlow` class

### 3. Compile-Time Error Checking
TypeScript catches potential errors at compile-time:
```typescript
// TypeScript will catch these errors:
const flow = createLLMFlow<{ topic: number }, string>( // Error: 'topic' should be string
"Write about {topic}",
['topic'],
{ model: 'invalid-model' } // Error: 'invalid-model' is not a valid model option
);
```
### 4. Enhanced Refactoring and Maintenance
Static typing makes refactoring safer and improves code navigation, especially valuable in large projects using LLMFlow.
### 5. Self-Documenting Code
TypeScript interfaces serve as inline documentation:
```typescript
interface VersioningOptions {
versioningEnabled: boolean;
storePath: string;
}
const flow = createLLMFlow<InputType, OutputType>(
template,
inputVariables,
llmOptions,
versioningOptions
);
```
### 6. Type Inference
TypeScript's type inference works seamlessly with LLMFlow:
```typescript
const flow = createLLMFlow(
"Summarize this text: {text}",
['text'],
{ model: 'gpt-4o-2024-05-13' }
);
// TypeScript infers: LLMFlow<{ text: string }, string>
```
### 7. Union Types for Strict Options
LLMFlow uses union types to enforce strict option values:
```typescript
type Temperature = 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1;
const flow = createLLMFlow(
template,
inputVars,
{ model: 'gpt-4o-2024-05-13', temperature: 0.7 } // Only valid temperature values are allowed
);
```
## Best Practices

Leverage TypeScript's type system to define clear interfaces for your input and output types.
Use TypeScript's strict mode to catch more potential issues.
Take advantage of IDE features like autocompletion and quick documentation for LLMFlow APIs.
Enable versioning in production to track changes in your prompts and configurations.
Handle errors appropriately, as LLM calls can sometimes fail or produce unexpected results.

## Next Steps

Explore the full API documentation for advanced usage and configuration options.
Check out the examples directory for more complex use cases and patterns.
Join our community forum to ask questions and share your experiences with LLMFlow.

Happy coding with LLMFlow!

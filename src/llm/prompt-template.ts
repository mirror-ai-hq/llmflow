export type ExtractVariables<T extends string> =
  T extends `${string}{{${infer Var}}}${infer Rest}`
    ? Var | ExtractVariables<Rest>
    : never;

export type InferredInputType<T extends string> = {
  [K in ExtractVariables<T>]: unknown;
};

export type StrictInputType<T extends string> = {
  [K in ExtractVariables<T>]: unknown;
};

export type PromptTemplate<T extends string> = {
  template: T;
};

export function createPromptTemplate<T extends string>(
  template: T
): PromptTemplate<T> {
  return { template };
}

export function formatPrompt<T extends string>(
  promptTemplate: PromptTemplate<T>,
  input: StrictInputType<T>
): string {
  return promptTemplate.template.replace(/{{(\w+)}}/g, (_, key) => {
    return String((input as any)[key] ?? "");
  });
}

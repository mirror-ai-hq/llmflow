export async function loadModule(moduleName: string) {
  try {
    if (typeof require === "function") {
      // CommonJS environment
      return require(moduleName);
    } else {
      // ES Module environment
      const module = await import("module");
      const createRequire = (module as any).createRequire;
      const require = createRequire(import.meta.url);
      return require(moduleName);
    }
  } catch (err: any) {
    throw new Error(`Failed to load module "${moduleName}": ${err.message}`);
  }
}

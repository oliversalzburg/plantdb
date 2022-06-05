export const executeAsyncContext = (context: () => Promise<unknown>) => {
  return void context().catch(console.error);
};

export const prepareAsyncContext = (context: () => Promise<unknown>) => {
  return () => executeAsyncContext(context);
};

export const executeAsyncContext = (
  context: () => Promise<unknown>,
  resolve?: (value: unknown) => void,
  reject?: (error: Error) => void
) => {
  return void context()
    .then(resolve ?? (() => undefined))
    .catch(reject ?? console.error);
};

export const prepareAsyncContext = (context: () => Promise<unknown>) => {
  return () => executeAsyncContext(context);
};

export const coalesceOnError = async <TExecutableReturn, T>(
  executable: (...args: Array<unknown>) => Promise<TExecutableReturn>,
  to: T
) => {
  try {
    return await executable();
  } catch (error) {
    return to;
  }
};

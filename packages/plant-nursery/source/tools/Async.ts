export const executeAsyncContext = (
  context: () => Promise<unknown>,
  resolve?: (value: unknown) => void,
  reject?: (error: Error) => void,
) => {
  return void context()
    .then(resolve ?? (() => undefined))
    .catch(reject ?? console.error);
};

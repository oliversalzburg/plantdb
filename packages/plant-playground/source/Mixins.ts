/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Describes literally any function.
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * Any constructor
 */
export type AnyConstructor = new (...args: any[]) => any;

/**
 * Describes a function returning an instance of T.
 */
export type FunctionReturning<T = any> = (...args: any[]) => T;

/**
 * Describes a function that is a constructor for T.
 */
export type ConstructorOf<T = Record<string, unknown>> = new (...args: any[]) => T;

export type Mixin<T extends FunctionReturning> = InstanceType<ReturnType<T>>;

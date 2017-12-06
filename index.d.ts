// Type definitions for derf 3.0.1
// Project: derf
// Definitions by: Nick Clawson <https://github.com/nickclaw>

type Namespace = string | Function;

type Wrapper<T extends Function> = (fn: T) => T;

type Decorator<T> = (...args: any[]) => T;

type Printer = (
    debug: (...args: any[]) => void,
    time: number,
    args: any[],
    retArgs: any[],
) => void;

export function sync<T extends Function>(
    namespace: Namespace,
    fn: T,
    printer?: Printer,
): T;

export function promise<T extends Function>(
    namespace: Namespace,
    fn: T,
    printer?: Printer,
): T;

export function callback<T extends Function>(
    namespace: Namespace,
    fn: T,
    printer?: Printer,
): T;

export function middleware<T extends Function>(
    namespace: Namespace,
    fn: T,
    printer?: Printer,
): T;

export function timeSync<R, T extends TypedPropertyDescriptor<R>>(
    namespace: Namespace
): Decorator<T>;

export function timePromise<R, T extends TypedPropertyDescriptor<R>>(
    namespace: Namespace
): Decorator<T>;

export function timeCallback<R, T extends TypedPropertyDescriptor<R>>(
    namespace: Namespace
): Decorator<T>;

export function timeMiddleware<R, T extends TypedPropertyDescriptor<R>>(
    namespace: Namespace
): Decorator<T>;

export function isWrapped(
    val: any
): boolean;

// TODO
export function createDecorator(...args: any[]): any;
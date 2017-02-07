import { DERFED } from './constants';

export * from './sync';
export * from './promise';
export * from './callback';
export * from './middleware';
export { createDecorator } from './utils';
export const isWrapped = (fn) => !!fn && !!fn[DERFED];

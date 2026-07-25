import type { Discount } from './types';

export const INITIAL_DISCOUNTS: Discount[] = [];

export const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

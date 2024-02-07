import { Json } from './types';

export function traverseJSON<T>(
	obj: Json,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	callback: (value: any, key: string | number) => T | undefined,
): T | undefined {
	if (!obj) return;
	if (typeof obj === 'object') {
		const entries = Object.entries(obj);
		for (const [key, value] of entries) {
			const itemResult = callback(value, key);
			if (itemResult) return itemResult;
			const subResult = traverseJSON(value, callback);
			if (subResult) return subResult;
		}
	}
}

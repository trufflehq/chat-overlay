import { Err, err, Ok, ok } from 'neverthrow';

import { Continuation, LiveChatResponse, LiveChatAction, Json, JsonObject, Result } from './util/types';

export type StreamData = {
	initialData: Json;
	config: YTConfig;
};

export type YTConfig = {
	INNERTUBE_API_KEY: string;
	INNERTUBE_CONTEXT: Json;
} & JsonObject;

/**
 * Gets the stream data from the given url.
 * @param {string} url The url to get the stream data from.
 * @return {Promise<Ok<StreamData, unknown> | Err<unknown, [string, number]>>} The stream data if found, otherwise an error.
 */
export async function getStreamData(url: string): Promise<Ok<StreamData, unknown> | Err<unknown, [string, number]>> {
	const response = await fetch(url);
	if (!response || response.status === 404) return err(['Stream not found', 404]);
	if (!response.ok) return err(['Failed to fetch stream: ' + response.statusText, response.status]);

	const text = await response.text();

	const initialData = getMatch(text, /(?:window\s*\[\s*["']ytInitialData["']\s*\]|ytInitialData)\s*=\s*({.+?})\s*;/);
	if (initialData.isErr()) return initialData;
	const config = getMatch<YTConfig>(text, /(?:ytcfg.set)\(({[\s\S]+?})\)\s*;/);
	if (config.isErr()) return config;

	if (!config.value.INNERTUBE_API_KEY || !config.value.INNERTUBE_CONTEXT) return err(['Failed to load YouTube context', 500]);

	return ok({ initialData: initialData.value, config: config.value });
}

/**
 * Attempts to find a match in the given html string using the given pattern.
 * @param {string} html The html string to search.
 * @param {RegExp} pattern The pattern to search for.
 * @return {Result<T, [string, number]>} The match if found, otherwise an error.
 */
function getMatch<T extends Json = Json>(html: string, pattern: RegExp): Result<T, [string, number]> {
	const match = pattern.exec(html);
	if (!match?.[1]) return err(['Failed to find video data', 404]);
	try {
		return ok(JSON.parse(match[1]));
	} catch {
		return err(['Failed to parse video data', 404]);
	}
}

/**
 * Gets the continuation token from the given continuation object.
 * @param {Continuation} continuation The continuation object.`
 * @return {string} The continuation token.
 */
export function getContinuationToken(continuation: Continuation): string {
	const key = Object.keys(continuation)[0] as keyof Continuation;
	return continuation[key]?.continuation;
}

/**
 * Fetches the chat from the given continuation token.
 * @param {string} continuationToken The continuation token to fetch the chat from.
 * @return {Promise} The chat if found, otherwise an error.
 */
export async function fetchChat(
	continuationToken: string,
): Promise<Err<never, { message: string; status: number }> | Ok<{ nextToken: string; actions: LiveChatAction[] }, never>> {
	let nextToken = continuationToken;
	try {
		const body = JSON.stringify({
			context: {
				client: {
					hl: 'en',
					clientName: 'WEB',
					clientVersion: '2.20230831.09.00',
					clientFormFactor: 'UNKNOWN_FORM_FACTOR',
					acceptHeader:
						'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
					utcOffsetMinutes: 720,
					memoryTotalKbytes: '8000000',
					mainAppWebInfo: {
						webDisplayMode: 'WEB_DISPLAY_MODE_BROWSER',
						isWebNativeShareAvailable: false,
					},
				},
				user: {
					lockedSafetyMode: false,
				},
				request: {
					useSsl: true,
					internalExperimentFlags: [
						{
							key: 'force_enter_once_in_webview',
							value: 'true',
						},
					],
				},
			},
			continuation: continuationToken,
			webClientInfo: { isDocumentHidden: false },
		});

		const res = await fetch('https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=KEY', {
			method: 'POST',
			body,
		});

		if (!res.ok) {
			return err({ message: 'Failed to fetch chat', status: res.status });
		}

		const data = await res.json();

		if (data === null || data === undefined) return err({ message: 'Failed to fetch chat', status: 404 });

		const liveChatResponse = data as LiveChatResponse;

		const liveChatContinuation = liveChatResponse.continuationContents?.liveChatContinuation;
		const nextContinuation = liveChatContinuation?.continuations?.[0];
		nextToken = (nextContinuation ? getContinuationToken(nextContinuation) : undefined) ?? continuationToken;

		const actions = liveChatContinuation?.actions?.map(({ clickTrackingParams, ...item }) => item) || [];

		return ok({ nextToken, actions });
	} catch (e) {
		return err({ message: 'Failed to fetch chat', status: 404 });
	}
}

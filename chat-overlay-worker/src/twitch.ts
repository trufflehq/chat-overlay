import { err, ok, Err, Ok } from 'neverthrow';

export type TwitchBadge = {
	data: {
		set_id: string;
		versions: [
			{
				image_url_1x: string;
				image_url_2x: string;
				image_url_4x: string;
				description: string;
				title: string;
			},
		];
	};
};

export const getTwitchGlobalBadges = async (): Promise<Ok<TwitchBadge, unknown> | Err<unknown, [string, number]>> => {
	const response = await fetch(`https://api.twitch.tv/helix/chat/badges/global`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Client-ID': 'CLIENT_ID',
			Authorization: 'AUTHORIZATION',
		},
	});
	if (!response.ok) return err(['Failed to fetch badges: ' + response.statusText, response.status]);

	const twitchBadge = (await response.json()) as TwitchBadge;

	return ok(twitchBadge);
};

export const getTwitchBadges = async (broadcasterId: string): Promise<Ok<TwitchBadge, unknown> | Err<unknown, [string, number]>> => {
	const response = await fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${broadcasterId}`, {
		method: 'GET',
		headers: {
			Accept: 'application/json',
			'Client-ID': 'CLIENT_ID',
			Authorization: 'AUTHORIZATION',
		},
	});
	if (!response.ok) return err(['Failed to fetch badges: ' + response.statusText, response.status]);

	const twitchBadge = (await response.json()) as TwitchBadge;

	return ok(twitchBadge);
};

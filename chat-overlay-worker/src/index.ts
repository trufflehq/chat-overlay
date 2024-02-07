import { getTwitchBadges, getTwitchGlobalBadges } from './twitch';
import { traverseJSON } from './util/util';
import { fetchChat, getContinuationToken, getStreamData } from './youtube';

export interface Env {
	CHAT_OVERLAY: DurableObjectNamespace;
}

export class ChatOverlay {
	private state: DurableObjectState;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		const pathname = url.pathname;

		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Content-Type': 'application/json',
		};

		if (pathname === '/getTwitchGlobalBadges') {
			const badges = await getTwitchGlobalBadges();

			if (badges.isErr()) {
				return new Response(JSON.stringify({ error: badges.error[0] }), {
					status: badges.error[1],
					headers: headers,
				});
			} else {
				return new Response(JSON.stringify({ badges: badges.value }), {
					status: 200,
					headers: headers,
				});
			}
		}

		if (pathname === '/getTwitchBadges') {
			const params = url.searchParams;
			const broadcasterId = params.get('broadcasterId') ?? '';

			const badges = await getTwitchBadges(broadcasterId);

			if (badges.isErr()) {
				return new Response(JSON.stringify({ error: badges.error[0] }), {
					status: badges.error[1],
					headers: headers,
				});
			} else {
				return new Response(JSON.stringify({ badges: badges.value }), {
					status: 200,
					headers: headers,
				});
			}
		}

		if (pathname === '/getChat') {
			const params = url.searchParams;
			const handle = params.get('handle');
			let continuationToken = params.get('continuationToken');
			let channelId: string | undefined;

			if (handle !== null) {
				const streamData = await getStreamData(`https://www.youtube.com/${handle}/live`);
				if (streamData.isErr()) {
					return new Response(JSON.stringify({ error: streamData.error[0] }), {
						status: streamData.error[1],
						headers: headers,
					});
				}

				const { initialData } = streamData.value;

				traverseJSON(initialData, (value) => {
					if (value.title === 'Live chat') {
						continuationToken = getContinuationToken(value.continuation);
					}
					if (value.channelId) {
						channelId = value.channelId;
					}
				});
			}

			if (continuationToken !== null) {
				const chat = await fetchChat(continuationToken);

				if (chat.isErr()) {
					return new Response(JSON.stringify({ error: chat.error.message }), {
						status: chat.error.status,
						headers: headers,
					});
				} else {
					return new Response(
						JSON.stringify({
							chat: {
								nextContinuation: chat.value.nextToken,
								actions: chat.value.actions,
								channelId: channelId,
							},
						}),
						{
							status: 200,
							headers: headers,
						},
					);
				}
			}

			return new Response(JSON.stringify({ error: 'handle or continuationToken must be provided' }), {
				status: 400,
				headers: headers,
			});
		}

		// Handle Webhook
		if (request.method === 'POST' && url.pathname.endsWith('/webhook')) {
			const postData = (await request.json()) as { orgId: string; theme: string };
			const orgId = postData.orgId;
			const theme = postData.theme;

			console.log('Webhook received', orgId, theme);

			const sockets = this.state.getWebSockets(orgId);
			console.log('Socket', sockets);

			sockets.forEach((socket) => {
				socket.send(JSON.stringify({ theme: theme }));

				console.log('Message sent to socket', socket);
			});

			return new Response('Sent to ' + sockets.length + ' sockets with the orgId ' + orgId);
		}

		// Handle WebSocket
		if (request.headers.get('Upgrade') === 'websocket') {
			const orgId = url.searchParams.get('orgId');
			console.log('WebSocket request', orgId);
			const pair = new WebSocketPair();
			const [clientSocket, serverSocket] = Object.values(pair);

			if (orgId !== null) {
				this.state.acceptWebSocket(serverSocket, [orgId]);

				serverSocket.addEventListener('message', (event) => {
					// Handle incoming messages
					console.log('Received message', event.data);
				});

				serverSocket.addEventListener('close', (event) => {
					// Handle WebSocket closure
					console.log(`WebSocket closed with ${orgId}. Code: ${event.code}, Reason: ${event.reason}`);
					// Here you can remove the WebSocket from your tracking, if you are keeping a list
					// this.state.removeWebSocket(serverSocket, orgId);
				});

				serverSocket.addEventListener('error', (event) => {
					// Handle errors
					console.error('WebSocket error', event);
					serverSocket.close(1011, 'Unexpected error'); // Close with error code 1011 (Internal Error)
				});

				console.log(this.state.getWebSockets());

				return new Response(null, {
					status: 101,
					headers: {
						Upgrade: 'websocket',
						Connection: 'Upgrade',
					},
					webSocket: clientSocket,
				});
			}
		}

		return new Response('Not Found', { status: 404 });
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let id = env.CHAT_OVERLAY.idFromName('chatOverlay');

		let stub = env.CHAT_OVERLAY.get(id);

		let response = await stub.fetch(request);

		return response;
	},
};

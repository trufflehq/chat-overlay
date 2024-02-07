import { truffleApp } from './truffle-app.ts';

export async function getTruffleEmoteReponse(channelId: string, platform: 'youtube' | 'twitch') {
  const EMOTES_QUERY = `
  query ExtensionEmotesQuery($input: EmoteConnectionInput) @cache {
    emoteConnection(input: $input) {
      nodes {
        id
        sourceType
        name
        urlParams
        isCollectibleRequired
      }
    }
    emoteSources {
      sourceType
      urlTemplate
    }
  }
`;

  const emotesResponse = await truffleApp.gqlClient
    .query(EMOTES_QUERY, {
      input: {
        channelLocator: {
          sourceType: platform,
          sourceId: channelId,
        },
      },
    })
    .toPromise();

  return emotesResponse;
}

export const getOrgResponse = async (channelId: string, platform: string) => {
  const ORG_QUERY = `
        query ($input: ChannelInput) {
            channel(input: $input) {
                id
                orgId
                sourceId
            }
        }
    `;

  const orgQuery = await truffleApp.gqlClient
    .query(ORG_QUERY, {
      input: {
        contentPageType: platform,
        contentPageOwnerRef: channelId,
        shouldCreateOrg: false,
      },
    })
    .toPromise();

  return orgQuery;
};

// use @ to get to lop-level src
import { Route } from '@/deps/router.ts';
import { ChatOverlay } from './channel.tsx';
import { rootRoute } from '@/app.tsx';

export const channelRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/$sourceType/$channelHandle',
  component: ChatOverlay,
});

import { RouterProvider, Router } from './deps/router.ts';
import { rootRoute } from './app.tsx';
import { channelRoute } from './pages/channel/channel.route.ts';

// NOTE: if this app/embed/site is iframed, we don't want to create new browser history
// entries when navigating. otherwise hitting back in youtube will just go back in the iframe
// which isn't what folks expect.
const isIframed = window.self !== window.top;
if (isIframed) {
  window.history.pushState = window.history.replaceState;
}

// NOTE: don't do anything fancy with routing, there's a decent chance we replace
// this with fs-based routing in near future. see truffle-dev-server repo for example.
// post in discord if what you're about to do is more than just adding a new route

const routeTree = rootRoute.addChildren([channelRoute]);

export const router = new Router({ routeTree });

// Register router for maximum type safety (docs told me to)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const RouterWrapper = () => {
  return <RouterProvider router={router} />;
};

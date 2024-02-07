import { RootRoute, Outlet } from './deps/router.ts';
import { useStyleSheet } from './deps/styles.ts';
import { styleSheet } from './global.scss.ts';
import { truffleApp } from '@/shared/truffle-app.ts';
import { Provider as UrqlProvider } from '@/deps/urql.ts';

export const App = () => {
  useStyleSheet(styleSheet);

  return (
    <>
      {/* give urql the right gql client to use, via truffle-sdk */}
      <UrqlProvider value={truffleApp.gqlClient}>
        <Outlet />
      </UrqlProvider>
    </>
  );
};

export const rootRoute = new RootRoute({
  component: App,
});

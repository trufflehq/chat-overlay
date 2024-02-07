import { Outlet } from '@/deps/router.ts';
import { createContext, useContext } from 'react';

const OutletContext = createContext<unknown>(null);

export const OutletWithContext = ({ context }: { context?: unknown }) => {
  return (
    <OutletContext.Provider value={context}>
      <Outlet />
    </OutletContext.Provider>
  );
};

export function useOutletContext<Context = unknown>(): Context {
  return useContext(OutletContext) as Context;
}

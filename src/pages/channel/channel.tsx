// use @ to get to lop-level src
import { useParams, useSearch } from '@/deps/router.ts';
import { Chat } from '@/components/chat/chat.tsx';
import { ThemeProvider } from '@/shared/ThemeContext.tsx';
// if it's a type only relevant to this page or component, put in (page|component)-name.types.ts
// import { ExampleObject } from './example.types.ts';

export const ChatOverlay = () => {
  const { sourceType, channelHandle } = useParams();
  const settings: {
    themeDuration?: number;
  } = useSearch();

  return (
    <ThemeProvider>
      <Chat sourceType={sourceType} handle={channelHandle} settings={settings} />
    </ThemeProvider>
  );
};

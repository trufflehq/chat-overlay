import { parseEmojis } from '@/shared/twemoji.ts';
import { ChatMessage } from '../chat/chat.types.ts';
import { Fragment } from 'react';

// always use const for components (important so we can wrap components in Legend's observer method)
export const Message = ({ badges, username, content }: ChatMessage) => {
  const contentWithoutSpaces = content.filter((item) => {
    // Check if the item is a string and not just an empty or whitespace-only string
    return !(typeof item === 'string' && item.trim() === '');
  });

  const usernameStyle =
    username.gradientColor === undefined
      ? { color: username.color }
      : {
          background: username.gradientColor,
          webkitBackgroundClip: 'text',
          webkitTextFillColor: 'transparent',
          color: username.color,
          textShadow: 'none',
        };

  return (
    <div className="c-message">
      {badges.map((badge) => (
        <img key={badge.name} className="badge" src={badge.url} alt={badge.name} />
      ))}
      <span className={`username`} style={usernameStyle}>
        {parseEmojis(username.text).map((emoji, index) =>
          typeof emoji !== 'string' ? (
            <Fragment key={index}>
              <img className={emoji.type} src={emoji.url} alt={emoji.name} draggable={false} />
            </Fragment>
          ) : (
            <Fragment key={index}>{emoji}</Fragment>
          ),
        )}
      </span>
      <span className="colon">: </span>
      <span className="content">
        {contentWithoutSpaces.map((node, index) => {
          const previousNode = contentWithoutSpaces[index - 1];
          const nextNode = contentWithoutSpaces[index + 1];

          if (typeof node === 'string') {
            return <Fragment key={index}>{node}</Fragment>;
          }

          const isZeroWidthEmote = node.type === 'zero-width-emote';

          if (nextNode !== undefined && typeof nextNode !== 'string') {
            const nextNodeIsZeroWidth = index < content.length - 1 && nextNode?.type === 'zero-width-emote';

            if (nextNodeIsZeroWidth) return null;
          }

          if (isZeroWidthEmote && previousNode !== undefined && typeof previousNode !== 'string') {
            return (
              <Fragment key={index}>
                <span className="zero-width-container" key={index}>
                  <img className={previousNode.type} src={previousNode.url} alt={previousNode.name} draggable={false} />
                  <img className={node.type} src={node.url} alt={node.name} draggable={false} />
                </span>
              </Fragment>
            );
          }

          return (
            <Fragment key={index}>
              <img className={node.type} src={node.url} alt={node.name} draggable={false} />
            </Fragment>
          );
        })}
      </span>
    </div>
  );
};

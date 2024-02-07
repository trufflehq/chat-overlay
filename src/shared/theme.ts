// theme.ts

import { EventEmitter } from 'events';

export const themeEventEmitter = new EventEmitter();

export const switchTheme = (newTheme: string) => {
  themeEventEmitter.emit('changeTheme', newTheme);
};

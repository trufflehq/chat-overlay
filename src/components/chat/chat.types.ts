export type ChatMessage = {
  id: string;
  badges: ChatObject[];
  username: Username;
  content: (string | ChatObject)[];
};

export type Username = {
  id: string;
  text: string;
  color: string;
  gradientColor?: string;
};

export type ChatObject = {
  type: 'emoji' | 'emote' | 'zero-width-emote' | 'badge';
  url: string;
  name: string;
};

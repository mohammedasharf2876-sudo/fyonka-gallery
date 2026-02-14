
export type Sender = 'user' | 'bot';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  image?: string;
}

export enum Category {
  Accessories = 'accessories',
  Makeup = 'makeup',
  Skincare = 'skincare',
  General = 'general'
}

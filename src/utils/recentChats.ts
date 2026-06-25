export interface RecentChat {
  path: string;
  name: string;
  openedAt: number;
}

const STORAGE_KEY = "wa-export-viewer:recent-chats";
const MAX_RECENT = 8;

export const getRecentChats = (): RecentChat[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentChat[]) : [];
  } catch {
    return [];
  }
};

const save = (chats: RecentChat[]): RecentChat[] => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  return chats;
};

export const addRecentChat = (path: string, name: string): RecentChat[] => {
  const rest = getRecentChats().filter((chat) => chat.path !== path);
  return save([{ path, name, openedAt: Date.now() }, ...rest].slice(0, MAX_RECENT));
};

export const removeRecentChat = (path: string): RecentChat[] =>
  save(getRecentChats().filter((chat) => chat.path !== path));

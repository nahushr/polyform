import emojiData from "./emoji-data.json";

export interface EmojiItem {
  group: string;
  codepoints: string;
  emoji: string;
  short_name: string;
  aliases: string[];
  keywords: string[];
}

export interface EmojiGroup {
  name: string;
  icon: string;
  items: EmojiItem[];
}

const CATEGORY_DEFINITIONS = [
  { name: "Smileys & Emotion", icon: "😀" },
  { name: "People & Body", icon: "👋" },
  { name: "Animals & Nature", icon: "🐻" },
  { name: "Food & Drink", icon: "🍔" },
  { name: "Travel & Places", icon: "🚗" },
  { name: "Activities", icon: "⚽" },
  { name: "Objects", icon: "💡" },
  { name: "Symbols", icon: "❤️" },
  { name: "Flags", icon: "🏳️" },
] as const;

const allEmojis = emojiData as EmojiItem[];

export const EMOJI_GROUPS: EmojiGroup[] = CATEGORY_DEFINITIONS.map(
  ({ name, icon }) => ({
    name,
    icon,
    items: allEmojis.filter((item) => item.group === name),
  }),
);

const SEARCHABLE_EMOJIS = EMOJI_GROUPS.flatMap(({ items }) => items).map(
  (item) => ({
    item,
    searchText: [
      item.group,
      item.short_name,
      ...item.aliases,
      ...item.keywords,
    ]
      .join(" ")
      .toLocaleLowerCase(),
  }),
);

export const searchEmojis = (query: string): EmojiItem[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return SEARCHABLE_EMOJIS.map(({ item }) => item);

  return SEARCHABLE_EMOJIS.filter(({ searchText }) =>
    searchText.includes(normalizedQuery),
  ).map(({ item }) => item);
};

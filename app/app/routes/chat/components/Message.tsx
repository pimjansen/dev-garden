import { useMemo } from "react";
import EmojiConvertor from "emoji-js";
import { format } from "date-fns";

interface IProps {
  by: string;
  date: Date;
  message: string;
  mapToPrevious: boolean;
}

export interface IMessage {
  id: string;
  by: string;
  message: string;
  createdAt: Date;
}

export default function Message({ mapToPrevious, by, date, message }: IProps) {
  const parsedMessage = useMemo(() => {
    const emoji = new EmojiConvertor();
    emoji.replace_mode = "unified";
    emoji.allow_native = true;

    // First replace common emoticons with emoji shortcodes
    let text = message
      .replace(/:\)/g, "🙂")
      .replace(/:-\)/g, "🙂")
      .replace(/:D/g, "😀")
      .replace(/:-D/g, "😀")
      .replace(/:\(/g, "🙁")
      .replace(/:-\(/g, "🙁")
      .replace(/;-?\)/g, "😉")
      .replace(/:P/g, "😛")
      .replace(/:-P/g, "😛")
      .replace(/:p/g, "😛")
      .replace(/:-p/g, "😛")
      .replace(/<3/g, "❤️")
      .replace(/:\|/g, "😐")
      .replace(/:-\|/g, "😐")
      .replace(/:o/gi, "😮")
      .replace(/:-o/gi, "😮");

    // Then replace :emoji_name: format
    return emoji.replace_colons(text);
  }, [message]);

  if (mapToPrevious) {
    return (
      <article className="flex gap-4 mb-4">
        <div>
          <p className="whitespace-pre-wrap">{parsedMessage}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-4 mb-4">
      <img src="https://placehold.co/40x40" className="h-10 w-10 rounded-md" alt="User Avatar" />
      <div>
        <header>
          <span className="font-semibold mr-4">{by}</span>
          <time className="font-extralight text-xs">{format(date, "HH:mm")}</time>
        </header>
        <p className="whitespace-pre-wrap">{parsedMessage}</p>
      </div>
    </article>
  );
}

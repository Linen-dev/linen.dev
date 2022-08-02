import ALIASES from './utilities/aliases';
import { TokenType, tokenize } from './utilities/lexer';

interface Props {
  text?: string;
}

export default function Emoji({ text }: Props) {
  if (!text) {
    return null;
  }
  text = text.replace(/\:\)/g, '😃');
  const tokens = tokenize(text);
  return (
    <>
      {tokens.map((token) => {
        if (token.type === TokenType.Emoji) {
          const alias = (ALIASES as { [key: string]: string })[token.value];
          if (alias) {
            return alias;
          }
          return `:${token.value}:`;
        }
        return token.value;
      })}
    </>
  );
}

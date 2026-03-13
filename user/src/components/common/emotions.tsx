import { Picker } from 'emoji-mart';
import { useEffect, useRef } from 'react';

interface IProps {
  onEmojiClick: Function;
  siteName?: string;
}

export function Emotions({
  onEmojiClick,
  siteName
}: IProps) {
  const ref = useRef();

  const handleClickEmoji = (emoji) => {
    onEmojiClick(emoji.native);
  };

  useEffect(() => {
    // eslint-disable-next-line no-new
    new Picker({
      data: async () => {
        const response = await fetch(
          'https://cdn.jsdelivr.net/npm/@emoji-mart/data'
        );

        return response.json();
      },
      onEmojiSelect: handleClickEmoji,
      title: siteName || '',
      ref
    });
  }, []);

  return <div ref={ref} />;
}

Emotions.defaultProps = {
  siteName: ''
};

export default Emotions;

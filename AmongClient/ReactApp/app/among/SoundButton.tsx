import React, { useRef } from "react";

const SoundButton: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/knife.mp3");
    }

    audioRef.current.currentTime = 0; // rewind
    audioRef.current.play().catch(console.error);
  };

  return (
    <button onClick={playSound}>
      Play Sound
    </button>
  );
};

export default SoundButton;
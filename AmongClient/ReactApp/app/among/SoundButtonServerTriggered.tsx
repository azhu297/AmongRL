import React, { useEffect, useRef, useState } from "react";

const ServerSoundPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // One-time user interaction to unlock audio
  const unlockAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/knife.mp3");
    }

    // Play silently to unlock
    audioRef.current.volume = 0;
    audioRef.current.play()
      .then(() => {
        audioRef.current!.pause();
        audioRef.current!.currentTime = 0;
        audioRef.current!.volume = 1;
        setAudioUnlocked(true);
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!audioUnlocked) return;

    socketRef.current = new WebSocket(`wss://localhost:7111/ws/sound`);

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "PLAY_SOUND") {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      }
    };

    socketRef.current.onerror = console.error;

    return () => {
      socketRef.current?.close();
    };
  }, [audioUnlocked]);

  const triggerServer = () => {
    const sendData = { type: "PLS_PLAY" };
    const dataString = JSON.stringify(sendData);
    socketRef.current?.send(dataString);
  }

  return (
    <div>
      {!audioUnlocked && (
        <button onClick={unlockAudio}>
          Enable Sounds
        </button>
      )}
      {audioUnlocked && <p>🔊 Sounds enabled</p>}
      <button onClick={triggerServer} disabled={!audioUnlocked}>
        Trigger server
      </button>
    </div>
  );
};

export default ServerSoundPlayer;

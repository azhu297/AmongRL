import React, { useEffect, useRef, useState } from 'react';
import Button from "@mui/material/Button";
import "./AmongPlayer.css"

const AmongPlayer: React.FC = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [started, setStarted] = useState(false);
  const [meetingActive, setMeetingActive] = useState(false);

  // One-time user interaction to unlock audio and start the game
  const start = () => {
    const audio = new Audio("/sounds/knife.mp3");
    // Play silently to unlock
    audio.volume = 0;
    audio.play()
      .then(() => {
        audio!.pause();
        audio!.currentTime = 0;
        audio!.volume = 1;
        setStarted(true);
      })
      .catch(console.error);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!started) return;
    
    socketRef.current = new WebSocket(`wss://${import.meta.env.VITE_SERVER_URL}/api/ws/among`);
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "MEETING") {
        setMeetingActive(true);
        if (!audioRef.current) {
          audioRef.current = new Audio("/sounds/meeting_alarm.wav");
        }
          
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
        
        navigator.vibrate([200, 100, 200, 200, 100, 200]);
      }
      
      if (data.type === "PLAY") {
        // TODO: start play
      }
    };

    socketRef.current.onerror = console.error;

    return () => {
      socketRef.current?.close();
    };
  }, [started]);
  
  const playKill = () => {
    const audio = new Audio("/sounds/knife.mp3");
    audio.play().catch(err => {
      console.error("Failed to play sound:", err);
    });
    navigator.vibrate(200);
  }
  
  const reportBody = () => {
    const sendData = { type: "REPORT_BODY" };
    const dataString = JSON.stringify(sendData);
    socketRef.current?.send(dataString);
  }

  return (
    <div className="page">
      <div className={`game-screen ${meetingActive ? "meeting-active" : ""}`}>
        {!started && (
          <Button className="game-button" onClick={start}>
            Start
          </Button>
        )}

        {started && (
          <div className="button-group">
            {meetingActive && <p className="meeting-text">Body found! Go to the meeting!</p>}
            <Button className="game-button" onClick={reportBody}>
              Report Body
            </Button>
            <Button className="game-button" onClick={playKill}>
              Kill 🔊
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AmongPlayer;
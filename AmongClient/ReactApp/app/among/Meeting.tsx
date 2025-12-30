import React, { use, useEffect, useRef, useState } from 'react';
import Button from "@mui/material/Button";
import "./AmongPlayer.css"
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface GameState {
  state: "MEETING" | "PLAYING";
  since?: Date,
  killCooldownUntil?: Date,
}

interface Settings {
  killCooldownSeconds: number,
  taskCount: number,
  meetingTimeSeconds: number,
}

const Meeting: React.FC = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [started, setStarted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>({state: "PLAYING"});
  const [settings, setSettings] = useState<Settings>({killCooldownSeconds: 60, taskCount: 6, meetingTimeSeconds: 120});

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

  const meetingAudioRef = useRef<HTMLAudioElement | null>(null);

  const connectWebsocket = () => {
    socketRef.current = new WebSocket(`wss://${import.meta.env.VITE_SERVER_URL}/ws/among`);
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "MEETING") {
        setGameState(prev => {
          return {state: data.type, since: new Date(data.since), killCooldownUntil: undefined}
        })

        if (!meetingAudioRef.current) {
          meetingAudioRef.current = new Audio("/sounds/meeting_alarm.wav");
        }

        meetingAudioRef.current.currentTime = 0;
        meetingAudioRef.current.play().catch(console.error);

        navigator.vibrate([200, 100, 200, 200, 100, 200]);
      }

      if (data.type === "START_PLAYING") {
        setGameState(prev => {
          return {
            state: "PLAYING",
            since: new Date(data.since),
            killCooldownUntil: new Date(new Date(data.since).getTime() + settings.killCooldownSeconds)
          }
        })
      }

      if (data.type === "SETTINGS") {
        setSettings({
          killCooldownSeconds: data.killCooldownSeconds,
          taskCount: data.taskCount,
          meetingTimeSeconds: data.meetingTimeSeconds
        });
      }
    };

    socketRef.current.onerror = console.error;
  }

  useEffect(() => {
    if (!started) return;
    connectWebsocket();

    const interval = setInterval(() => {
      // Reconnect websocket in case the connection was closed, for example because the user suspended their browser on mobile
      if (socketRef.current?.readyState !== WebSocket.OPEN) {
        connectWebsocket();
      }
    }, 5_000);

    return () => {
      console.info("Closing socket connection because component is unmounting")
      socketRef.current?.close();
      interval.close()
    };
  }, [started]);

  const startPlaying = () => {
    const sendData = {type: "START_PLAYING"};
    const dataString = JSON.stringify(sendData);
    socketRef.current?.send(dataString);
  }


  const reportBody = () => {
    const sendData = {type: "REPORT_BODY"};
    const dataString = JSON.stringify(sendData);
    socketRef.current?.send(dataString);
  }

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const secondsSince =
    gameState.since != null
      ? Math.floor(
        (now - new Date(gameState.since).getTime()) / 1000
      )
      : "ERROR";

  const meetingUntil =
    secondsSince !== "ERROR"
      ? Math.max(0, 120 - secondsSince)
      : "ERROR";

  return (
    <div className="page">
      <div className={`game-screen ${gameState.state === "MEETING" ? "meeting-active" : ""}`}>
        {!started && (
          <Button className="game-button" onClick={start}>
            Start
          </Button>
        )}

        {started && (
          <div className="vertical-container">
            {gameState.state === "MEETING" &&
              <p className="meeting-text">Body found {secondsSince} seconds ago! Meeting over
                in {meetingUntil} seconds!</p>}
            {gameState.state === "PLAYING" && <p className="playing-text">Playing since {secondsSince} seconds.</p>}

            <Button className="game-button" onClick={() => startPlaying()}>
              Start Playing
            </Button>
            <Button className="game-button" onClick={() => reportBody()}>
              Call Meeting
            </Button>

          </div>
        )}
      </div>
    </div>
  );
}

export default Meeting;
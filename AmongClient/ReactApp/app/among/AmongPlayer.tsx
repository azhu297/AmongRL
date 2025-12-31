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
}

const AmongPlayer: React.FC = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const [started, setStarted] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>({ state: "PLAYING" });
  const [settings, setSettings] = useState<Settings>({ killCooldownSeconds: 45, taskCount: 6 });

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
        setGameState(prev => { return { state: "MEETING", since: new Date(data.since), killCooldownUntil: undefined }})

        if (!meetingAudioRef.current) {
          meetingAudioRef.current = new Audio("/sounds/meeting_alarm.wav");
        }

        meetingAudioRef.current.currentTime = 0;
        meetingAudioRef.current.play().catch(console.error);

        navigator.vibrate([200, 100, 200, 200, 100, 200]);
      }

      if (data.type === "START_PLAYING") {
        setGameState(prev => { return { state: "PLAYING", since: new Date(data.since), killCooldownUntil: new Date(new Date(data.since).getTime() + settings.killCooldownSeconds * 1000) }})
      }
      
      if (data.type === "SETTINGS") {
        setSettings({ killCooldownSeconds: data.killCooldownSeconds, taskCount: data.taskCount });
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


  
  const playKill = () => {
    setGameState(prevState => { return {...prevState, killCooldownUntil: new Date(Date.now() + settings.killCooldownSeconds * 1000)}});
    // const audio = new Audio("/sounds/knife.mp3");
    // audio.play().catch(err => {
    //   console.error("Failed to play sound:", err);
    // });
    navigator.vibrate(400);
  }

  const handleConfirm = () => {
    setConfirmDialogOpen(false);
    reportBody();
  };

  const handleCancel = () => {
    setConfirmDialogOpen(false);
  };
  
  const reportBody = () => {
    const sendData = { type: "REPORT_BODY" };
    const dataString = JSON.stringify(sendData);
    socketRef.current?.send(dataString);
  }

  const [secondsSince, setSecondsSince] = useState<number | "ERROR">("ERROR");

  useEffect(() => {
    if (!gameState.since) {
      setSecondsSince("ERROR");
      return;
    }
    
    const update = () => {
      console.log("Updating second since!")
      setSecondsSince(
        Math.floor((Date.now() - gameState.since!.getTime()) / 1000)
      );
    };

    update(); // initial update
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [gameState.since]);
  
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
            {gameState.state === "MEETING" && <p className="meeting-text">Body found {secondsSince} seconds ago! Go to the meeting!</p>}
            {gameState.state === "PLAYING" && <p className="playing-text">Playing since {secondsSince} seconds.</p>}
            <Button className="game-button" onClick={() => setConfirmDialogOpen(true)}>
              Report Body
            </Button>
            <Button className="game-button" onClick={playKill} disabled={gameState.state === "MEETING" || (!gameState.killCooldownUntil?.getTime() ? false : gameState.killCooldownUntil!.getTime() > Date.now())}>
              Kill - {(gameState.killCooldownUntil?.getTime() ?? 0) < Date.now() ? `Start Cooldown ${settings.killCooldownSeconds}` : `Cooldown ${Math.floor((gameState.killCooldownUntil!.getTime()! - Date.now()) / 1000)}`}
            </Button>
          </div>
        )}
      </div>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancel}
        slotProps={{
          paper: { className: "confirm-dialog"}
        }}
        className="confirm-dialog-container"
      >
        <DialogTitle className="confirm-dialog-title">
          Are you sure you want to report a body?
        </DialogTitle>

        <DialogActions className="confirm-dialog-actions">
          <Button
            onClick={handleCancel}
            className="game-button confirm-cancel"
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirm}
            autoFocus
            className="game-button confirm-accept"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default AmongPlayer;
import { Button, Col, Row } from "antd";
import "./App.css";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState([]);
  const [isPlayingId, setIsPlayingId] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const mediaRecorder = useRef(null);
  const audioRef = useRef(null);

  const vibrate =
    navigator.vibrate ||
    navigator.webkitVibrate ||
    navigator.mozVibrate ||
    navigator.msVibrate;

  const vibrateDevice = () => {
    if (vibrate) {
      vibrate.call(navigator, [100]);
    }
  };

  const startRecording = (e) => {
    e.preventDefault();
    vibrateDevice();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setMediaStream(stream);
        const mediaRecorderInstance = new MediaRecorder(stream);
        mediaRecorderInstance.ondataavailable = (e) => {
          if (e.data.size > 0) {
            const blob = new Blob([e.data], { type: "audio/wav" });
            setAudioBlob([...audioBlob, blob]);
          }
        };
        mediaRecorderInstance.start();
        mediaRecorder.current = mediaRecorderInstance;
        setIsRecording(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const stopRecording = (e) => {
    e.preventDefault();
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => {
          track.stop(); // Остановка медиапотока
        });
        setMediaStream(null); // Очистка состояния медиапотока
      }
      vibrateDevice();
    }
  };

  const playAudio = (blob, id) => {
    if (blob) {
      const audioUrl = URL.createObjectURL(blob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlayingId(id);
    }
  };

  const handleAudioPlay = () => {
    setIsPlayingId(isPlayingId);
  };

  const handleAudioEnded = () => {
    setIsPlayingId(null);
  };

  return (
    <div className="App">
      <Button
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        style={{ userSelect: "none", marginBottom: "10px" }}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        icon={<FontAwesomeIcon color="orange" icon={faMicrophone} />}
        shape="circle"
        type={isRecording ? "primary" : "default"}
        size="large"
      ></Button>

      <Row
        style={{ display: "flex", flexDirection: "column", gap: "5px" }}
        align={"middle"}
      >
        {audioBlob.map((blob, index) => {
          return (
            <Col>
              <Button
                type={isPlayingId === index ? "primary" : "default"}
                onClick={() => playAudio(blob, index)}
                icon={
                  isPlayingId !== index ? (
                    <FontAwesomeIcon icon={faPlay} />
                  ) : (
                    <FontAwesomeIcon icon={faPause} />
                  )
                }
              >
                Голосовое {index + 1}
              </Button>
            </Col>
          );
        })}
      </Row>
      <audio
        ref={audioRef}
        onPlay={handleAudioPlay}
        onEnded={handleAudioEnded}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default App;

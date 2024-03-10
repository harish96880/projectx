import React, { useState, useRef } from "react";
import axios from "axios";
import "./Card.css";

const Card = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const mediaRecorderRef = useRef(null);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState(null);
  const chunksRef = useRef([]);

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.addEventListener("dataavailable", (event) => {
          chunksRef.current.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/wav" });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
        });

        mediaRecorder.start();
        setRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing user media:", error);
      });
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);

      // Set the recorded audio blob
      const recordedBlob = new Blob(chunksRef.current, { type: "audio/wav" });
      setRecordedAudioBlob(recordedBlob);
    }
  };

  const recapture = () => {
    setAudioBlob(null);
    setAudioUrl("");
  };

  const uploadAudioBlob = () => {
    if (!recordedAudioBlob) {
      console.error("No recorded audio to send");
      return;
    }
    const formData = new FormData();
    formData.append("audio", recordedAudioBlob);

    axios
      .post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Audio uploaded successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error uploading audio:", error);
      });
  };

  return (
    <div className="voice-recorder-container">
      <div className="voice-recorder">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">
              Voice <span style={{ color: "purple" }}>AI</span>
            </h5>
            {audioBlob ? (
              <div className="audio-controls">
                <audio controls>
                  <source src={audioUrl} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
                <button className="btn recapture-btn" onClick={recapture}>
                  Recapture
                </button>
                <button className="btn upload-btn" onClick={uploadAudioBlob}>
                  Upload Audio
                </button>
              </div>
            ) : (
              <button
                className={`btn ${
                  recording ? "btn-danger" : "btn-primary"
                } recording-btn`}
                onClick={recording ? stopRecording : startRecording}
              >
                {recording ? "Stop Recording" : "Start Recording"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;

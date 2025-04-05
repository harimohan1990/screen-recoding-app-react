import React, { useRef, useState, useEffect } from 'react';
import './App.css';

const ScreenRecorder = () => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [stream, setStream] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [stream, timerInterval]);

  const handleStartRecording = async () => {
    try {
      setError('');
      const captureStream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = captureStream;
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(captureStream, { mimeType });
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = url;
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setStream(captureStream);

      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      console.error('Error: ' + err);
      setError('Failed to start recording. Please allow screen sharing and microphone access.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handlePlay = () => {
    videoRef.current?.play();
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  const handleDownload = () => {
    if (recordedUrl) {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = recordedUrl;
      a.download = `recording-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(recordedUrl);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <h1 className="title">React Screen Recorder</h1>

      {error && <p className="error-message">{error}</p>}

      <div className="button-group">
        <button
          onClick={handleStartRecording}
          disabled={recording}
          className="start-btn"
        >
          🎬 Start Recording
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!recording}
          className="stop-btn"
        >
          🛑 Stop Recording
        </button>
        {recording && (
          <span className="timer">⏱ {formatTime(recordingTime)}</span>
        )}
      </div>

      <video ref={videoRef} autoPlay controls muted />

      {recordedUrl && (
        <div className="controls">
          <button onClick={handlePlay} className="play-btn">▶️ Play</button>
          <button onClick={handlePause} className="pause-btn">⏸ Pause</button>
          <button onClick={handleDownload} className="download-btn">📥 Download</button>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;

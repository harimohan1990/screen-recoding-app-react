import React, { useRef, useState, useEffect } from 'react';
import '../../App.css';

const ScreenRecorder: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [recording, setRecording] = useState<boolean>(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState< null>(null);
  const [error, setError] = useState<string>('');
  const [includeMic, setIncludeMic] = useState<boolean>(true);
  const [includeWebcam, setIncludeWebcam] = useState<boolean>(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      stream?.getTracks().forEach(track => track.stop());
      webcamStream?.getTracks().forEach(track => track.stop());
    };
  }, [stream, timerInterval, webcamStream]);

  const handleStartRecording = async () => {
    try {
      setError('');
      setRecordedUrl(null);
      setRecordingTime(0);

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: includeMic,
      });

      let finalStream = displayStream;

      if (includeWebcam) {
        const webcam = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        setWebcamStream(webcam);

        const combinedTracks = [
          ...displayStream.getVideoTracks(),
          ...webcam.getVideoTracks(),
          ...(includeMic ? displayStream.getAudioTracks() : []),
        ];

        finalStream = new MediaStream(combinedTracks);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = finalStream;
      }

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const mediaRecorder = new MediaRecorder(finalStream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

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
      setStream(finalStream);

      const interval:any= setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to start recording. Please allow screen and microphone access.');
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    stream?.getTracks().forEach(track => track.stop());

    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    setRecording(false);
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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`container ${darkMode ? 'dark' : ''}`}>
      <h1 className="title">🎥 React Screen Recorder</h1>

      <div className="toggle-dark">
        <label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </label>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="options">
        <label>
          <input
            type="checkbox"
            checked={includeMic}
            onChange={() => setIncludeMic(!includeMic)}
          />
          🎤 Include Microphone
        </label>
        <label>
          <input
            type="checkbox"
            checked={includeWebcam}
            onChange={() => setIncludeWebcam(!includeWebcam)}
          />
          📷 Include Webcam
        </label>
      </div>

      <div className="button-group">
        <button onClick={handleStartRecording} disabled={recording} className="start-btn">
          ⏺ Start Recording
        </button>
        <button onClick={handleStopRecording} disabled={!recording} className="stop-btn">
          ⏹ Stop Recording
        </button>
        {recording && <span className="timer">⏱ {formatTime(recordingTime)}</span>}
      </div>

      <video ref={videoRef} autoPlay controls muted className="video" />

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

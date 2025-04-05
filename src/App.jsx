import React, { useRef, useState, useEffect } from 'react';

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
    <div className="p-6 text-center bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">React Screen Recorder</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-x-4 mb-6">
        <button
          onClick={handleStartRecording}
          disabled={recording}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          🎬 Start Recording
        </button>
        <button
          onClick={handleStopRecording}
          disabled={!recording}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          🛑 Stop Recording
        </button>
        {recording && (
          <span className="text-lg font-mono text-gray-700">⏱ {formatTime(recordingTime)}</span>
        )}
      </div>

      <video
        ref={videoRef}
        autoPlay
        controls
        muted
        className="mx-auto max-w-4xl border rounded-lg shadow"
      />

      {recordedUrl && (
        <div className="mt-6 space-x-4">
          <button
            onClick={handlePlay}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            ▶️ Play
          </button>
          <button
            onClick={handlePause}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            ⏸ Pause
          </button>
          <button
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            📥 Download
          </button>
        </div>
      )}
    </div>
  );
};

export default ScreenRecorder;

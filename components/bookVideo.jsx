'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityBadge, setQualityBadge] = useState('HD');
  const [notification, setNotification] = useState({ show: false, message: '' });

  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const progressInterval = useRef(null);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        videoId: 'AhGiQIJmqnk',
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      window.onYouTubeIframeAPIReady();
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      // Cleanup player on unmount to prevent duplicates
      if (playerRef.current && playerRef.current.destroy) {
        try {
            playerRef.current.destroy();
        } catch (e) {
            console.warn("Player cleanup error", e);
        }
      }
    };
  }, []);

  const onPlayerReady = (event) => {
    setDuration(event.target.getDuration());
    setIsLoading(false);
    
    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const dur = playerRef.current.getDuration();
        setCurrentTime(curr);
        setDuration(dur);
        if (dur > 0) {
            setProgress((curr / dur) * 100);
        }
      }
    }, 200);
  };

  const onPlayerStateChange = (event) => {
    if (!window.YT) return;
    
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setIsLoading(false);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      setIsLoading(true);
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (playerRef.current.isMuted()) {
      playerRef.current.unMute();
      setIsMuted(false);
      setVolume(playerRef.current.getVolume());
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume == 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
        if (playerRef.current.isMuted()) playerRef.current.unMute();
      }
    }
  };

  const seekVideo = (e) => {
    if (!playerRef.current) return;
    const progressBar = e.currentTarget;
    const clickPosition = (e.pageX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const seekTime = clickPosition * playerRef.current.getDuration();
    playerRef.current.seekTo(seekTime);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const changePlaybackSpeed = () => {
    if (!playerRef.current) return;
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentSpeed = playerRef.current.getPlaybackRate();
    const currentIndex = speeds.indexOf(currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const nextSpeed = speeds[nextIndex];
    
    playerRef.current.setPlaybackRate(nextSpeed);
    triggerNotification(`Playback speed: ${nextSpeed}x`);
    setShowSettings(false);
  };

  const changeQuality = () => {
    // Note: Actual quality change requires YouTube API support which is limited in iframe api for setting playback quality directly reliably,
    // but this simulates the UI interaction.
    const qualities = ['small', 'medium', 'large', 'hd720', 'hd1080', 'highres'];
    const currentText = qualityBadge;
    let nextText = 'HD';
    
    if (currentText === '144p') nextText = '360p';
    else if (currentText === '360p') nextText = '480p';
    else if (currentText === '480p') nextText = '720p HD';
    else if (currentText === '720p HD') nextText = '1080p HD';
    else if (currentText === '1080p HD') nextText = '4K';
    else nextText = '144p';

    setQualityBadge(nextText);
    triggerNotification(`Quality: ${nextText}`);
    setShowSettings(false);
  };

  const triggerNotification = (msg) => {
    setNotification({ show: true, message: msg });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 2000);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return minutes + ':' + (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

        <h1 className="text-4xl mb-4 text-center mt-16">বইটি কি বিষয়ে এক নজরে ভিডিওতে দেখে নিন!</h1>
      <div className="flex justify-center items-center  p- bg-linear-to-br  text-white font-['Inter',sans-serif] overflow-x-hidden">

        
        {/* Main Video Container */}
        <div 
          className="relative w-full max-w-[900px] rounded-[20px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] bg-black transition-transform duration-300 hover:-translate-y-1 md:rounded-[20px] rounded-[15px] group" 
          ref={containerRef}
        >
          
          <div className="relative pb-[56.25%] h-0 overflow-hidden">
            {/* YouTube Player Iframe */}
            <div id="player" className="absolute top-0 left-0 w-full h-full"></div>
            
            {/* Overlay Gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-black/30 via-transparent via-20% to-80% to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            
            {/* Loading Indicator */}
            <div 
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60px] h-[60px] border-[3px] border-white/20 border-t-[#4facfe] rounded-full animate-spin ${isLoading ? 'block' : 'hidden'}`}
            ></div>
            
            {/* Quality Badge */}
            <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-[20px] text-xs font-medium">
              {qualityBadge}
            </div>
            
            {/* Notification */}
            <div 
              className={`absolute top-5 left-1/2 -translate-x-1/2 bg-black/70 text-white px-5 py-2.5 rounded-[30px] text-sm font-medium z-100 transition-opacity duration-300 ${notification.show ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
              {notification.message}
            </div>

            {/* Center Play Button */}
            <div 
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer opacity-0 transition-all duration-300 group-hover:opacity-100 max-[480px]:w-[60px] max-[480px]:h-[60px] ${isPlaying ? '!hidden pointer-events-none' : 'flex'}`}
              onClick={togglePlayPause}
            >
              <i className="fas fa-play text-[30px] text-white ml-1.5 max-[480px]:text-[24px]"></i>
            </div>

            {/* Custom Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-linear-to-t from-black/90 to-transparent translate-y-full transition-transform duration-300 group-hover:translate-y-0 group-focus-within:translate-y-0 max-[768px]:p-[15px]">
              <div className="flex items-center gap-[15px]">
                
                {/* Play/Pause Button */}
                <button 
                  className="bg-white/10 hover:bg-white/20 text-white cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md hover:scale-110 border-none max-[768px]:w-9 max-[768px]:h-9 max-[480px]:w-8 max-[480px]:h-8"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? <i className="fas fa-pause text-base"></i> : <i className="fas fa-play text-base"></i>}
                </button>

                {/* Volume Controls */}
                <div className="flex items-center gap-2.5 group/volume">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md hover:scale-110 border-none max-[768px]:w-9 max-[768px]:h-9 max-[480px]:w-8 max-[480px]:h-8"
                    onClick={toggleMute}
                  >
                    {isMuted ? <i className="fas fa-volume-mute text-base"></i> : <i className="fas fa-volume-up text-base"></i>}
                  </button>
                  <div className="w-0 opacity-0 transition-[width,opacity] duration-300 group-hover/volume:w-[100px] group-hover/volume:opacity-100 max-[768px]:group-hover/volume:w-[80px]">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume} 
                      onInput={handleVolumeChange} 
                      className="w-full h-1 bg-white/20 rounded-sm appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div 
                  className="grow h-1.5 bg-white/20 rounded-[10px] cursor-pointer relative overflow-hidden group/progress"
                  onClick={seekVideo}
                >
                  <div 
                    className="h-full bg-linear-to-r from-[#4facfe] to-[#00f2fe] rounded-[10px] relative w-0 shadow-[0_0_10px_rgba(79,172,254,0.7)] after:content-[''] after:absolute after:-right-2 after:top-1/2 after:-translate-y-1/2 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-[0_0_10px_rgba(0,0,0,0.3)] after:opacity-0 after:transition-opacity after:duration-200 group-hover/progress:after:opacity-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Time Display */}
                <div className="text-white/80 text-[13px] font-medium min-w-[90px] text-center max-[480px]:text-[11px] max-[480px]:min-w-[70px]">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Settings Button */}
                <button 
                  className="bg-white/10 hover:bg-white/20 text-white cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md hover:scale-110 border-none max-[768px]:w-9 max-[768px]:h-9 max-[480px]:w-8 max-[480px]:h-8"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <i className="fas fa-cog text-base"></i>
                </button>

                {/* Fullscreen Button */}
                <button 
                  className="bg-white/10 hover:bg-white/20 text-white cursor-pointer w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md hover:scale-110 border-none max-[768px]:w-9 max-[768px]:h-9 max-[480px]:w-8 max-[480px]:h-8"
                  onClick={toggleFullscreen}
                >
                  <i className="fas fa-expand text-base"></i>
                </button>
              </div>
            </div>

            {/* Settings Menu */}
            <div className={`absolute bottom-[70px] right-5 bg-[#14141e]/95 backdrop-blur-xl rounded-xl p-2.5 min-w-[180px] shadow-2xl z-10 ${showSettings ? 'block' : 'hidden'}`}>
              <div 
                className="p-[10px_15px] rounded-lg cursor-pointer transition-colors duration-200 flex justify-between items-center hover:bg-white/10"
                onClick={changePlaybackSpeed}
              >
                <span>Playback Speed</span>
                <i className="fas fa-chevron-right text-sm text-white/60"></i>
              </div>
              <div 
                className="p-[10px_15px] rounded-lg cursor-pointer transition-colors duration-200 flex justify-between items-center hover:bg-white/10"
                onClick={changeQuality}
              >
                <span>Quality</span>
                <i className="fas fa-chevron-right text-sm text-white/60"></i>
              </div>
            </div>
          </div>

          {/* Video Title & Meta */}
          <div className="p-5 bg-white/5 backdrop-blur-md border-t border-white/10">
            <h2 className="text-xl font-semibold mb-2 max-[768px]:text-lg">বইটি কি বিষয়ে এক নজরে ভিডিওতে দেখে নিন!</h2>
            <div className="flex items-center gap-[15px] text-white/70 text-sm max-[768px]:text-[13px]">
              <span className="flex items-center gap-[5px]"><i className="fas fa-eye"></i> 1.2M views</span>
              <span className="flex items-center gap-[5px]"><i className="fas fa-thumbs-up"></i> 45K</span>
              <span className="flex items-center gap-[5px]"><i className="fas fa-share"></i> Share</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
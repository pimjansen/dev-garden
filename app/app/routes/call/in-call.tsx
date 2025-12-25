import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Button from "~/sdk/Button";
// import { MediasoupService } from "~/utils/mediasoup-client";

// Track service globally to prevent React Strict Mode double-mount issues
let globalService: MediasoupService | null = null;
let globalCleanupTimeout: NodeJS.Timeout | null = null;

export default function InCall() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [callDuration, setCallDuration] = useState(0);
  const mediasoupRef = useRef<MediasoupService | null>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const hasEndedRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);

  const roomId = searchParams.get("room") || "default-room";
  const callerName = searchParams.get("caller") || "John Doe";

  useEffect(() => {
    console.log(
      "🔵 InCall component mounted, globalService exists:",
      !!globalService
    );

    // Clear any pending cleanup from React Strict Mode test unmount
    if (globalCleanupTimeout) {
      console.log("⏹️ Cancelling pending cleanup from Strict Mode");
      clearTimeout(globalCleanupTimeout);
      globalCleanupTimeout = null;
    }

    // Timer for call duration (always start regardless of initialization state)
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Skip initialization if already exists (React Strict Mode remount)
    if (globalService) {
      console.log("⚠️ Already initialized, reusing existing connection");
      mediasoupRef.current = globalService;

      // Return cleanup function that only handles timer
      return () => {
        console.log("🟡 InCall cleanup called (reused connection)");
        clearInterval(timer);

        // Delay cleanup to handle React Strict Mode double-mount
        globalCleanupTimeout = setTimeout(() => {
          console.log("🔴 Executing delayed cleanup");

          // Only cleanup if not already ended manually
          if (!hasEndedRef.current && globalService) {
            globalService.disconnect();
            globalService = null;
          }

          // Clean up audio elements
          if (audioContainerRef.current) {
            audioContainerRef.current.innerHTML = "";
          }

          globalCleanupTimeout = null;
        }, 100);
      };
    }

    console.log("🆕 Creating new MediasoupService");
    const service = new MediasoupService();
    globalService = service;
    mediasoupRef.current = service;

    const initializeCall = async () => {
      try {
        console.log("📞 Connecting to room:", roomId);
        // Connect to room
        await service.connect(roomId);
        console.log("✅ Connected to room");
        setIsConnected(true);

        console.log("🎤 Starting audio stream");
        // Start audio stream
        await service.startAudioStream();

        // Handle new audio tracks from other participants
        service.setOnNewAudioTrack((track, peerId) => {
          console.log("New audio track from peer:", peerId);

          // Create audio element for this peer
          const audio = new Audio();
          audio.srcObject = new MediaStream([track]);
          audio.autoplay = true;
          audio.id = `audio-${peerId}`;

          // Explicitly play the audio to overcome autoplay restrictions
          audio.play().catch((error) => {
            console.error("Failed to autoplay audio:", error);
          });

          if (audioContainerRef.current) {
            audioContainerRef.current.appendChild(audio);
          }

          // Add to participants list
          setParticipants((prev) => {
            if (!prev.includes(peerId)) {
              return [...prev, peerId];
            }
            return prev;
          });
        });
      } catch (error) {
        console.error("Failed to initialize call:", error);
        alert("Failed to join call. Please check your microphone permissions.");
        navigate("/");
      }
    };

    initializeCall();

    return () => {
      console.log("🟡 InCall cleanup called (new connection)");
      clearInterval(timer);

      // Delay cleanup to handle React Strict Mode double-mount
      // If component remounts within 100ms, cleanup will be cancelled
      globalCleanupTimeout = setTimeout(() => {
        console.log("🔴 Executing delayed cleanup");

        // Only cleanup if not already ended manually
        if (!hasEndedRef.current && globalService) {
          globalService.disconnect();
          globalService = null;
        }

        // Clean up audio elements
        if (audioContainerRef.current) {
          audioContainerRef.current.innerHTML = "";
        }

        globalCleanupTimeout = null;
      }, 100);
    };
  }, [roomId, navigate]);

  const handleMuteToggle = () => {
    if (mediasoupRef.current) {
      const muted = mediasoupRef.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const handleEndCall = () => {
    // Mark as manually ended to prevent cleanup in useEffect
    hasEndedRef.current = true;

    // Cancel any pending cleanup
    if (globalCleanupTimeout) {
      clearTimeout(globalCleanupTimeout);
      globalCleanupTimeout = null;
    }

    // Clean up audio elements first
    if (audioContainerRef.current) {
      audioContainerRef.current.innerHTML = "";
    }

    // Disconnect mediasoup
    if (globalService) {
      globalService.disconnect();
      globalService = null;
    }
    mediasoupRef.current = null;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8">
      <img
        className="rounded-full"
        src="https://placehold.co/300x300"
        alt="User name"
      />
      <h1 className="font-bold text-3xl">{callerName}</h1>
      <p className="text-slate-400">
        {isConnected ? formatDuration(callDuration) : "Connecting..."}
      </p>

      {participants.length > 0 && (
        <div className="text-sm text-slate-500">
          {participants.length}{" "}
          {participants.length === 1 ? "participant" : "participants"} in call
        </div>
      )}

      <div className="flex gap-8">
        <Button
          className="h-20 w-20 rounded-full bg-slate-700"
          onClick={handleMuteToggle}
          disabled={!isConnected}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? "🔇" : "🎤"}
        </Button>
        <Button
          className="h-20 w-20 rounded-full bg-red-700"
          onClick={handleEndCall}
        >
          End
        </Button>
      </div>

      {/* Hidden container for audio elements */}
      <div ref={audioContainerRef} style={{ display: "none" }} />
    </div>
  );
}

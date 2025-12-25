import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { io } from "socket.io-client";
import Button from "~/sdk/Button";
// import { MediasoupService } from "~/utils/mediasoup-client";

export default function Incoming() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);
  const [callerName, setCallerName] = useState("Someone");

  const roomId = searchParams.get("room") || "default-room";

  // Redirect to home if no active call (no caller info in state)
  useEffect(() => {
    if (!location.state?.from) {
      console.warn("No active call found, redirecting to home");
      navigate("/", { replace: true });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Get caller name from navigation state (not from URL)
    if (location.state?.from) {
      setCallerName(location.state.from);
    }
  }, [location]);

  // Listen for call cancellation
  useEffect(() => {
    const username = localStorage.getItem("username") || "Anonymous";

    const socket = io("http://localhost:4000", {
      auth: {
        username,
        isMediaConnection: true, // Don't show in users list
      },
    });

    socket.on("call-cancelled", ({ roomId: cancelledRoomId }) => {
      console.log(`Call cancelled for room: ${cancelledRoomId}`);
      if (cancelledRoomId === roomId) {
        console.log("This call was cancelled, redirecting to home");
        navigate("/", { replace: true });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, navigate]);

  const handleAccept = async () => {
    setIsConnecting(true);
    try {
      // Navigate to in-call view with caller name
      navigate(
        `/call/in-call?room=${roomId}&caller=${encodeURIComponent(callerName)}`
      );
    } catch (error) {
      console.error("Failed to accept call:", error);
      setIsConnecting(false);
    }
  };

  const handleDecline = () => {
    // Navigate back to home or previous page
    navigate("/");
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
        {isConnecting ? "Connecting..." : "Incoming call ..."}
      </p>
      <div className="flex gap-8">
        <Button
          className="h-20 w-20 rounded-full bg-red-700"
          onClick={handleDecline}
          disabled={isConnecting}
        >
          Decline
        </Button>
        <Button
          className="h-20 w-20 rounded-full bg-green-700"
          onClick={handleAccept}
          disabled={isConnecting}
        >
          Accept
        </Button>
      </div>
    </div>
  );
}

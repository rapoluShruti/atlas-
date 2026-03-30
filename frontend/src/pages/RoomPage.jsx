import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Peer from "peerjs";

const RoomPage = () => {
  const { roomId } = useParams();
  const [peers, setPeers] = useState({});
  const [participantCount, setParticipantCount] = useState(1);
  const socketRef = useRef();
  const peerRef = useRef();
  const myVideoRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef();

  useEffect(() => {
    // Connect to socket
    socketRef.current = io("http://localhost:5000");

    // Initialize PeerJS
    peerRef.current = new Peer(undefined, {
      host: "localhost",
      port: 5001,
      path: "/",
    });

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        // Join room
        peerRef.current.on("open", (peerId) => {
          socketRef.current.emit("join-room", roomId, peerId);
        });

        // Handle incoming calls
        peerRef.current.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (remoteStream) => {
            addVideoStream(call.peer, remoteStream);
          });
        });

        // Handle user connected
        socketRef.current.on("user-connected", (peerId) => {
          connectToNewUser(peerId, stream);
        });

        // Handle user disconnected
        socketRef.current.on("user-disconnected", (peerId) => {
          if (peersRef.current[peerId]) {
            peersRef.current[peerId].close();
            setPeers((prev) => {
              const newPeers = { ...prev };
              delete newPeers[peerId];
              return newPeers;
            });
            setParticipantCount(Object.keys(peersRef.current).length + 1);
          }
        });
      });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [roomId]);

  const connectToNewUser = (peerId, stream) => {
    const call = peerRef.current.call(peerId, stream);
    call.on("stream", (remoteStream) => {
      addVideoStream(peerId, remoteStream);
    });
    call.on("close", () => {
      setPeers((prev) => {
        const newPeers = { ...prev };
        delete newPeers[peerId];
        return newPeers;
      });
      setParticipantCount(Object.keys(peersRef.current).length + 1);
    });
    peersRef.current[peerId] = call;
  };

  const addVideoStream = (peerId, stream) => {
    setPeers((prev) => ({
      ...prev,
      [peerId]: stream,
    }));
    setParticipantCount(Object.keys(peersRef.current).length + 2); // +1 for self, +1 for new
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Room link copied!");
  };

  return (
    <div
      style={{
        backgroundColor: "#0b0f0c",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1>Room: {roomId}</h1>
        <p>Participants: {participantCount}</p>
        <button
          onClick={copyRoomLink}
          style={{
            backgroundColor: "#22c55e",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Copy Room Link
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* My video */}
        <div
          style={{
            backgroundColor: "#111827",
            borderRadius: "10px",
            padding: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            animation: "fadeIn 0.5s",
          }}
        >
          <video
            ref={myVideoRef}
            autoPlay
            muted
            style={{
              width: "100%",
              borderRadius: "5px",
            }}
          />
          <p style={{ textAlign: "center", marginTop: "10px" }}>You</p>
        </div>

        {/* Other videos */}
        {Object.entries(peers).map(([peerId, stream]) => (
          <div
            key={peerId}
            style={{
              backgroundColor: "#111827",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              animation: "fadeIn 0.5s",
            }}
          >
            <video
              autoPlay
              style={{
                width: "100%",
                borderRadius: "5px",
              }}
              ref={(video) => {
                if (video && video.srcObject !== stream) {
                  video.srcObject = stream;
                }
              }}
            />
            <p style={{ textAlign: "center", marginTop: "10px" }}>
              Participant {peerId.slice(0, 8)}
            </p>
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default RoomPage;
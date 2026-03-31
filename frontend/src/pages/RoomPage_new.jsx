import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import YogaTrainer from "./YogaTrainer.jsx";

const RoomPage = () => {
  const { roomId } = useParams();
  const [peers, setPeers] = useState({});
  const [participantCount, setParticipantCount] = useState(1);
  const myVideoRef = useRef();
  const peersRef = useRef({});
  const [showYogaTrainer, setShowYogaTrainer] = useState(false);

  useEffect(() => {
    // Mock video stream for demo
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing camera:", err));

    return () => {
      if (myVideoRef.current && myVideoRef.current.srcObject) {
        myVideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/dashboard/room/${roomId}`;
    navigator.clipboard.writeText(roomLink);
    alert("Room link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🧘</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Yoga Session</h1>
              <p className="text-gray-300 text-sm">Room: {roomId}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700 bg-opacity-50 px-3 py-1 rounded-full text-sm">
              👥 {participantCount} participants
            </div>
            <button
              onClick={copyRoomLink}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              📋 Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Main Video */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full relative">
                <video
                  ref={myVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm px-3 py-1 rounded-lg">
                  <span className="text-white text-sm font-medium">You</span>
                </div>
              </div>
            </div>

            {/* Participant Videos */}
            <div className="space-y-4">
              {Object.entries(peers).map(([peerId, stream]) => (
                <div key={peerId} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg aspect-video relative">
                  <video
                    autoPlay
                    className="w-full h-full object-cover"
                    ref={(video) => {
                      if (video && video.srcObject !== stream) {
                        video.srcObject = stream;
                      }
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 backdrop-blur-sm px-2 py-1 rounded">
                    <span className="text-white text-xs">Participant</span>
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: Math.max(0, 4 - Object.keys(peers).length) }).map((_, index) => (
                <div key={index} className="bg-gray-700 bg-opacity-50 rounded-xl aspect-video flex items-center justify-center border-2 border-dashed border-gray-600">
                  <div className="text-gray-400 text-center">
                    <div className="text-2xl mb-2">👤</div>
                    <div className="text-sm">Waiting for participant</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-md border-t border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-4">
          <button
            onClick={() => setShowYogaTrainer(!showYogaTrainer)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              showYogaTrainer
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-white'
            }`}
          >
            🧘 Yoga Trainer
          </button>

          <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-medium transition-all duration-200">
            🎤 Mute
          </button>

          <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-full font-medium transition-all duration-200">
            📹 Camera
          </button>

          <button
            onClick={() => window.history.back()}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-200 shadow-lg"
          >
            📞 Leave Room
          </button>
        </div>
      </div>

      {/* Yoga Trainer Modal */}
      {showYogaTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">🧘 Yoga Pose Trainer</h2>
              <button
                onClick={() => setShowYogaTrainer(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <YogaTrainer />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
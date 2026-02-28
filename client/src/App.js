import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [myId, setMyId] = useState("");
  const [myName, setMyName] = useState("");
  const [targetId, setTargetId] = useState("");
  const [activeCallId, setActiveCallId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [remoteName, setRemoteName] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);

  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        localStream.current = stream;
      });

    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("incoming-call", ({ from, name }) => {
      setIncomingCall(from);
      setRemoteName(name);
    });

    socket.on("call-accepted", async ({ from }) => {
      setActiveCallId(from);
      setCallAccepted(true);
      await createPeerConnection(from);

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit("offer", {
        targetId: from,
        offer
      });
    });

    socket.on("offer", async ({ from, offer }) => {
      setActiveCallId(from);
      setCallAccepted(true);

      await createPeerConnection(from);
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        targetId: from,
        answer
      });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    socket.on("user-not-available", () => {
      alert("User not available. Please check ID.");
    });

    socket.on("call-ended", () => {
      endCallCleanup();
    });

  }, []);

  const createPeerConnection = async (remoteId) => {
    if (peerConnection.current) return;

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          targetId: remoteId,
          candidate: event.candidate
        });
      }
    };
  };

  const callUser = () => {
    if (!myName) {
      alert("Please enter your name first.");
      return;
    }

    socket.emit("call-user", {
      targetId,
      name: myName
    });
  };

  const acceptCall = () => {
    socket.emit("accept-call", {
      targetId: incomingCall
    });
    setActiveCallId(incomingCall);
    setCallAccepted(true);
    setIncomingCall(null);
  };

  const hangUp = () => {
    if (activeCallId) {
      socket.emit("end-call", { targetId: activeCallId });
    }
    endCallCleanup();
  };

  const endCallCleanup = () => {
    setCallAccepted(false);
    setActiveCallId(null);

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  return (
    <div className="container">
      <h1 className="title">Smart Tap</h1>

      <div className="video-wrapper">
        <div className="video-box">
          <video ref={videoRef} autoPlay playsInline muted />
        </div>

        {callAccepted && (
          <div className="video-box">
            <video ref={remoteVideoRef} autoPlay playsInline />
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-left">
          <h3>Account Info</h3>
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
          />
          <button
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(myId)}
          >
            📋 COPY YOUR ID
          </button>
        </div>

        <div className="card-right">
          <h3>Make a call</h3>
          <input
            type="text"
            placeholder="ID to call"
            onChange={(e) => setTargetId(e.target.value)}
          />
          <button className="join-btn" onClick={callUser}>
            📞 CALL
          </button>
          <button className="hangup-btn" onClick={hangUp}>
            ❌ HANG UP
          </button>
        </div>
      </div>

      {incomingCall && (
        <div className="incoming-popup">
          <p>Incoming call from: <strong>{remoteName}</strong></p>
          <button onClick={acceptCall}>ACCEPT</button>
        </div>
      )}
    </div>
  );
}

export default App;
import { useEffect, useRef, useState } from "react";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";

import { db } from "../../firebase";

const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function VideoCall({ roomId, currentUserId, partnerId, disabled }) {
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const sessionRef = useRef(null);
  const seenCandidates = useRef(new Set());
  const [call, setCall] = useState(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const roomRef = roomId ? doc(db, "chatRooms", roomId) : null;

  function cleanUp() {
    peerRef.current?.close(); peerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null;
    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;
    seenCandidates.current = new Set();
  }

  useEffect(() => {
    if (!roomRef) return undefined;
    return onSnapshot(roomRef, (snap) => setCall(snap.data()?.videoCall || null));
  }, [roomId]);

  useEffect(() => {
    if (!call || !peerRef.current || !sessionRef.current || call.sessionId !== sessionRef.current) return;
    const isCaller = call.from === currentUserId;
    const candidates = isCaller ? call.answerCandidates || [] : call.offerCandidates || [];
    candidates.forEach(async (candidate) => {
      const key = candidate.candidate;
      if (seenCandidates.current.has(key)) return;
      seenCandidates.current.add(key);
      try { await peerRef.current.addIceCandidate(candidate); } catch { /* Candidate can arrive before the remote description. */ }
    });
    if (isCaller && call.status === "accepted" && call.answer && !peerRef.current.currentRemoteDescription) {
      peerRef.current.setRemoteDescription(call.answer).catch(() => setError("Could not connect the call."));
    }
    if (["declined", "ended"].includes(call.status)) cleanUp();
  }, [call, currentUserId]);

  useEffect(() => () => cleanUp(), []);

  async function getStream() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (localRef.current) localRef.current.srcObject = stream;
    return stream;
  }

  function makePeer(side) {
    const peer = new RTCPeerConnection(ICE);
    peerRef.current = peer;
    peer.ontrack = (event) => { if (remoteRef.current) remoteRef.current.srcObject = event.streams[0]; };
    peer.onicecandidate = (event) => {
      if (event.candidate && roomRef && sessionRef.current) {
        updateDoc(roomRef, { ["videoCall." + side]: arrayUnion(event.candidate.toJSON()) }).catch(() => {});
      }
    };
    return peer;
  }

  async function requestCall() {
    if (disabled || !partnerId || joining || call?.status === "requested" || call?.status === "accepted") return;
    setJoining(true); setError("");
    try {
      const stream = await getStream();
      const peer = makePeer("offerCandidates");
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      const offer = await peer.createOffer(); await peer.setLocalDescription(offer);
      const sessionId = crypto.randomUUID(); sessionRef.current = sessionId;
      await updateDoc(roomRef, { videoCall: { sessionId, from: currentUserId, to: partnerId, status: "requested", offer: { type: offer.type, sdp: offer.sdp }, offerCandidates: [], answerCandidates: [] } });
    } catch (cause) { cleanUp(); setError(cause.name === "NotAllowedError" ? "Allow camera and microphone access to start a video call." : "Could not start the video call."); }
    finally { setJoining(false); }
  }

  async function acceptCall() {
    if (!call?.offer || joining) return;
    setJoining(true); setError("");
    try {
      sessionRef.current = call.sessionId;
      const stream = await getStream(); const peer = makePeer("answerCandidates");
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      await peer.setRemoteDescription(call.offer);
      const answer = await peer.createAnswer(); await peer.setLocalDescription(answer);
      await updateDoc(roomRef, { "videoCall.status": "accepted", "videoCall.answer": { type: answer.type, sdp: answer.sdp } });
    } catch (cause) { cleanUp(); setError(cause.name === "NotAllowedError" ? "Allow camera and microphone access to accept." : "Could not accept the call."); }
    finally { setJoining(false); }
  }

  async function leave(status = "ended") { if (roomRef) await updateDoc(roomRef, { "videoCall.status": status }); cleanUp(); }
  const incoming = call?.status === "requested" && call.to === currentUserId;
  const outgoing = call?.status === "requested" && call.from === currentUserId;
  const active = call?.status === "accepted" && [call.from, call.to].includes(currentUserId);

  function toggle(kind) { const enabled = kind === "video" ? !videoOn : !audioOn; const tracks = kind === "video" ? streamRef.current?.getVideoTracks() : streamRef.current?.getAudioTracks(); tracks?.forEach((track) => { track.enabled = enabled; }); kind === "video" ? setVideoOn(enabled) : setAudioOn(enabled); }

  return <>
    <button type="button" onClick={requestCall} disabled={disabled || joining || incoming || outgoing || active} className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"><Video size={17} /> Video call</button>
    {(incoming || outgoing || active) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"><div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white"><div><h3 className="font-semibold">Private video call</h3><p className="text-sm text-slate-300">{incoming ? "Your companion is requesting a call." : outgoing ? "Waiting for your companion to accept…" : "Both people agreed to join."}</p></div>{!incoming && <button onClick={() => leave()} className="rounded-full bg-rose-500 p-2"><PhoneOff size={20} /></button>}</div><div className="grid gap-3 bg-slate-950 p-3 md:grid-cols-2"><video ref={remoteRef} autoPlay playsInline className="min-h-56 w-full rounded-2xl bg-slate-800 object-cover"/><video ref={localRef} autoPlay muted playsInline className="min-h-56 w-full rounded-2xl bg-slate-800 object-cover"/></div>{incoming ? <div className="flex justify-center gap-3 p-5"><button onClick={acceptCall} disabled={joining} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white"><Phone size={18}/> {joining ? "Joining…" : "Accept"}</button><button onClick={() => leave("declined")} className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white">Decline</button></div> : active ? <div className="flex justify-center gap-3 p-5"><button onClick={() => toggle("audio")} className="rounded-full bg-slate-700 p-3 text-white">{audioOn ? <Mic size={20}/> : <MicOff size={20}/>}</button><button onClick={() => toggle("video")} className="rounded-full bg-slate-700 p-3 text-white">{videoOn ? <Video size={20}/> : <VideoOff size={20}/>}</button><button onClick={() => leave()} className="rounded-full bg-rose-500 p-3 text-white"><PhoneOff size={20}/></button></div> : null}</div></div>}
    {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
  </>;
}

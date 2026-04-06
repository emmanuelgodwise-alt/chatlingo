/**
 * WebRTC Peer Connection Manager
 * Handles peer-to-peer audio/video connections for voice and video calls
 */

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
}

let peerConnection: RTCPeerConnection | null = null
let localStream: MediaStream | null = null
let remoteStream: MediaStream | null = null

export interface WebRTCCallbacks {
  onIceCandidate: (candidate: RTCIceCandidateInit) => void
  onRemoteStream: (stream: MediaStream) => void
  onIceConnectionStateChange: (state: RTCIceConnectionState) => void
  onTrack: (event: RTCTrackEvent) => void
}

/**
 * Get user media (microphone + optional camera)
 */
export async function getLocalStream(includeVideo: boolean): Promise<MediaStream> {
  try {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: includeVideo
        ? {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          }
        : false,
    }

    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    return localStream
  } catch (error) {
    console.error('Failed to get local stream:', error)
    throw new Error(
      includeVideo
        ? 'Camera and microphone access is required for video calls'
        : 'Microphone access is required for voice calls'
    )
  }
}

/**
 * Create a new RTCPeerConnection
 */
export function createPeerConnection(callbacks: WebRTCCallbacks): RTCPeerConnection {
  // Clean up any existing connection
  closePeerConnection()

  peerConnection = new RTCPeerConnection(ICE_SERVERS)

  // Create remote stream to hold incoming tracks
  remoteStream = new MediaStream()

  // Add local tracks to the peer connection
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      peerConnection!.addTrack(track, localStream!)
    })
  }

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      callbacks.onIceCandidate(event.candidate.toJSON())
    }
  }

  // Handle incoming remote tracks
  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream!.addTrack(track)
    })
    callbacks.onRemoteStream(remoteStream)
    callbacks.onTrack(event)
  }

  // Handle connection state changes
  peerConnection.oniceconnectionstatechange = () => {
    callbacks.onIceConnectionStateChange(peerConnection!.iceConnectionState)
  }

  return peerConnection
}

/**
 * Create an SDP offer (caller)
 */
export async function createOffer(): Promise<RTCSessionDescriptionInit> {
  if (!peerConnection) {
    throw new Error('Peer connection not established')
  }

  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  })

  await peerConnection.setLocalDescription(offer)
  return offer
}

/**
 * Create an SDP answer (callee)
 */
export async function createAnswer(): Promise<RTCSessionDescriptionInit> {
  if (!peerConnection) {
    throw new Error('Peer connection not established')
  }

  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)
  return answer
}

/**
 * Set the remote SDP description
 */
export async function setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
  if (!peerConnection) {
    throw new Error('Peer connection not established')
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(description))
}

/**
 * Add an ICE candidate from the remote peer
 */
export async function addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
  if (!peerConnection) {
    throw new Error('Peer connection not established')
  }

  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
}

/**
 * Get the current local stream
 */
export function getLocalStream(): MediaStream | null {
  return localStream
}

/**
 * Get the current remote stream
 */
export function getRemoteStream(): MediaStream | null {
  return remoteStream
}

/**
 * Toggle local video track (mute/unmute camera)
 */
export function toggleLocalVideo(enabled: boolean): void {
  if (localStream) {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = enabled
    })
  }
}

/**
 * Toggle local audio track (mute/unmute microphone)
 */
export function toggleLocalAudio(enabled: boolean): void {
  if (localStream) {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = enabled
    })
  }
}

/**
 * Close the peer connection and clean up streams
 */
export function closePeerConnection(): void {
  if (peerConnection) {
    peerConnection.onicecandidate = null
    peerConnection.ontrack = null
    peerConnection.oniceconnectionstatechange = null
    peerConnection.close()
    peerConnection = null
  }

  if (localStream) {
    localStream.getTracks().forEach((track) => track.stop())
    localStream = null
  }

  if (remoteStream) {
    remoteStream.getTracks().forEach((track) => track.stop())
    remoteStream = null
  }
}

/**
 * Check if WebRTC is supported in the current browser
 */
export function isWebRTCSupported(): boolean {
  return typeof RTCPeerConnection !== 'undefined'
}

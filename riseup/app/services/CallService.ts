import Peer, { MediaConnection } from 'peerjs';

const peerConfig = {
  host: '192.168.0.106', // Your backend server's IP
  port: 9000, // Port for PeerJS
  path: '/peerjs', // Path defined in your PeerJS server
};

export default class CallService {
  private peer: Peer | null = null;

  initialize(userId: string) {
    this.peer = new Peer(userId, peerConfig);

    // Peer connection established
    this.peer.on('open', (id: string) => {
      console.log(`Peer connected with ID: ${id}`);
    });

    // Handle incoming calls
    this.peer.on('call', (call: MediaConnection) => {
      console.log('Incoming call:', call);

      // Answer the call with an audio stream
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            console.log('Remote stream received:', remoteStream);
            // Play the remote audio stream (e.g., attach to an <audio> element)
          });
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error);
        });
    });
  }

  makeCall(targetUserId: string) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const call = this.peer?.call(targetUserId, stream);

        call?.on('stream', (remoteStream) => {
          console.log('Connected to remote stream:', remoteStream);
          // Play the remote audio stream (e.g., attach to an <audio> element)
        });
      })
      .catch((error) => {
        console.error('Error accessing media devices:', error);
      });
  }
}

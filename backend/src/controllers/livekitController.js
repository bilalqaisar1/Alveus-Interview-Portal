import { AccessToken, RoomConfiguration } from 'livekit-server-sdk';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

export const getConnectionDetails = async (req, res) => {
    try {
        if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
            return res.status(500).json({ error: 'LiveKit configuration missing' });
        }

        const { room_config } = req.body;
        const agentName = room_config?.agents?.[0]?.agent_name;

        const participantName = 'user';
        const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10000)}`;
        const roomName = `voice_assistant_room_${Math.floor(Math.random() * 10000)}`;

        const at = new AccessToken(API_KEY, API_SECRET, {
            identity: participantIdentity,
            name: participantName,
            ttl: '15m',
        });

        at.addGrant({
            room: roomName,
            roomJoin: true,
            canPublish: true,
            canPublishData: true,
            canSubscribe: true,
        });

        if (agentName) {
            at.roomConfig = new RoomConfiguration({
                agents: [{ agentName }],
            });
        }

        const participantToken = await at.toJwt();

        res.status(200).json({
            serverUrl: LIVEKIT_URL,
            roomName,
            participantToken,
            participantName,
        });
    } catch (error) {
        console.error('LiveKit token error:', error);
        res.status(500).json({ error: error.message });
    }
};

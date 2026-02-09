import { AccessToken, RoomConfiguration } from 'livekit-server-sdk';
import jwt from 'jsonwebtoken';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;
const JWT_SECRET = process.env.JWT_SECRET;

export const getConnectionDetails = async (req, res) => {
    try {
        if (!LIVEKIT_URL || !API_KEY || !API_SECRET) {
            return res.status(500).json({ error: 'LiveKit configuration missing' });
        }

        const { room_config, interviewId } = req.body;
        const agentName = room_config?.agents?.[0]?.agent_name;

        let participantName = 'Candidate';
        let metadata = { interviewId };

        if (interviewId) {
            console.log(`Fetching connection details for interview: ${interviewId}`);
            const interview = await Interview.findById(interviewId)
                .populate('candidateId', 'name')
                .populate('jobId', 'title');

            if (interview && interview.candidateId) {
                participantName = interview.candidateId.name || 'Candidate';
                const jobTitle = interview.jobId?.title || "Position";

                // Generate a Company Token for the agent to use
                const companyToken = jwt.sign(
                    { id: interview.recruiterId },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Add minimal metadata for the agent to reach back to the API
                metadata = {
                    ...metadata,
                    candidateName: participantName,
                    jobTitle: jobTitle,
                    companyToken: companyToken,
                    apiUrl: `${req.protocol}://${req.get('host')}/interview/llm-info/${interviewId}`,
                    system_prompt: `You are an expert AI Interviewer. You are interviewing ${participantName} for the ${jobTitle} role. 
                    
                    Use the provided interviewId and companyToken to fetch the full knowledge base (resume and job details) from the API if your deployment supports it.`,
                    greeting: `Hello ${participantName}! Welcome to your AI interview for the ${jobTitle} position. I am ready to start when you are.`
                };
            } else {
                console.warn(`Interview ${interviewId} not found or missing candidate.`);
            }
        }

        const participantIdentity = `user_${Math.floor(Math.random() * 10000)}_${Date.now()}`;

        // CRITICAL: Monitor metadata size. Tokens in URLs usually fail above 2-4KB.
        const metadataSize = Buffer.byteLength(JSON.stringify(metadata));
        console.log(`LiveKit Metadata Size: ${metadataSize} bytes. TARGET: < 1500 bytes for stability.`);

        // Use interviewId for room name if provided to ensure unique rooms per interview
        const roomName = interviewId
            ? `interview_room_${interviewId}`
            : `voice_assistant_room_${Math.floor(Math.random() * 10000)}`;

        const at = new AccessToken(API_KEY, API_SECRET, {
            identity: participantIdentity,
            name: participantName,
            ttl: '15m',
            // Pass minimal details in metadata to keep the URL short
            metadata: JSON.stringify(metadata),
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
                agents: [{
                    agentName,
                    metadata: JSON.stringify(metadata) // Send full metadata to the agent
                }],
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

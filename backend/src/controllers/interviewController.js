import Interview from "../models/Interview.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";

// Mock Google Calendar Service
const createGoogleCalendarEvent = async (summary, description, startTime, endTime) => {
    // In a real implementation, this would use googleapis to create an event
    // and add a conferenceData body for Google Meet.

    // Simulating API latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
        eventId: "mock-event-id-" + Date.now(),
        meetLink: "https://meet.google.com/abc-defg-hij", // Mock link
        status: "confirmed"
    };
};

export const getRecommendedSlots = async (req, res) => {
    try {
        const { jobId } = req.query;

        // Logic to find available slots could be complex (checking recruiter availability)
        // For now, we generate 3 slots: tomorrow 10am, day after 2pm, etc.

        const now = new Date();
        const slots = [];

        // Slot 1: Tomorrow at 10:00 AM
        const slot1 = new Date(now);
        slot1.setDate(slot1.getDate() + 1);
        slot1.setHours(10, 0, 0, 0);
        slots.push(slot1.getTime());

        // Slot 2: Day after tomorrow at 2:00 PM
        const slot2 = new Date(now);
        slot2.setDate(slot2.getDate() + 2);
        slot2.setHours(14, 0, 0, 0);
        slots.push(slot2.getTime());

        // Slot 3: 3 days from now at 11:00 AM
        const slot3 = new Date(now);
        slot3.setDate(slot3.getDate() + 3);
        slot3.setHours(11, 0, 0, 0);
        slots.push(slot3.getTime());

        res.json({ success: true, slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const scheduleInterview = async (req, res) => {
    try {
        const { applicationId, date } = req.body;
        const userId = req.userData._id; // user auth middleware

        const application = await JobApplication.findById(applicationId);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }

        const job = await Job.findById(application.jobId);

        const startTime = new Date(date);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        // 1. Create Google Calendar Event
        const googleEvent = await createGoogleCalendarEvent(
            `Interview for ${job.title}`,
            `Interview between Candidate and Recruiter for ${job.title}`,
            startTime,
            endTime
        );

        // 2. Save Interview to DB
        const interview = new Interview({
            applicationId,
            candidateId: userId,
            recruiterId: job.companyId,
            jobId: job._id,
            date: date,
            meetLink: googleEvent.meetLink,
            eventId: googleEvent.eventId,
            status: "Scheduled"
        });

        await interview.save();

        // 3. Update Application Status (optional)
        application.status = "Interview Scheduled";
        await application.save();

        // 4. Create Notification
        const notification = new Notification({
            recipientId: userId,
            recipientType: "User",
            senderId: job.companyId,
            senderType: "Company",
            jobApplicationId: applicationId,
            message: `Interview scheduled for ${job.title} on ${new Date(date).toLocaleString()}.`,
            type: "interview_scheduled"
        });
        await notification.save();

        res.json({ success: true, interview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserInterviews = async (req, res) => {
    try {
        const userId = req.userData._id;
        const interviews = await Interview.find({ candidateId: userId })
            .populate('jobId')
            .populate('recruiterId')
            .sort({ date: 1 });
        res.json({ success: true, interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getCompanyInterviews = async (req, res) => {
    try {
        const companyId = req.companyData._id;
        const interviews = await Interview.find({ recruiterId: companyId })
            .populate('jobId', 'title')
            .populate('candidateId', 'name email image')
            .populate('applicationId')
            .sort({ date: 1 });
        res.json({ success: true, interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getInterviewSummary = async (req, res) => {
    try {
        const companyId = req.companyData ? req.companyData._id : null;
        const query = companyId ? { recruiterId: companyId } : {};

        const interviews = await Interview.find(query)
            .populate('jobId', 'title')
            .populate('candidateId', 'name')
            .populate('applicationId', 'appliedResume')
            .sort({ date: 1 });

        const summary = interviews.map(interview => ({
            interviewId: interview._id,
            candidateName: interview.candidateId ? interview.candidateId.name : "N/A",
            candidateResume: interview.applicationId ? interview.applicationId.appliedResume : "N/A",
            interviewTime: new Date(interview.date).toLocaleString(),
            jobTitle: interview.jobId ? interview.jobId.title : "N/A",
            status: interview.status
        }));

        res.json({ success: true, interviews: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getInterviewLLMDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const interview = await Interview.findById(id)
            .populate('jobId')
            .populate('candidateId', '-password')
            .populate('applicationId');

        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview not found" });
        }

        // Helper function to strip HTML tags
        const stripHtml = (html) => {
            if (!html) return "";
            return html
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
                .replace(/&amp;/g, '&')  // Replace &amp; with &
                .replace(/&lt;/g, '<')   // Replace &lt; with <
                .replace(/&gt;/g, '>')   // Replace &gt; with >
                .replace(/&quot;/g, '"') // Replace &quot; with "
                .replace(/\s+/g, ' ')    // Collapse multiple spaces
                .trim();
        };

        // Extract text from resume if available
        let resumeContent = "No resume provided.";
        if (interview.applicationId && interview.applicationId.appliedResume) {
            resumeContent = await extractTextFromPDF(interview.applicationId.appliedResume);
        }

        const jobData = interview.jobId.toObject();

        const llmPayload = {
            interviewId: interview._id,
            candidate: {
                name: interview.candidateId?.name,
                email: interview.candidateId?.email,
                resumeText: resumeContent
            },
            job: {
                title: jobData.title,
                description: stripHtml(jobData.description), // Clean HTML from description
                location: jobData.location,
                level: jobData.level,
                category: jobData.category,
                salary: jobData.salary
            },
            schedule: {
                time: new Date(interview.date).toLocaleString(),
                status: interview.status
            }
        };

        res.json({ success: true, interviewDetail: llmPayload });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

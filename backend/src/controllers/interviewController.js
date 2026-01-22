import Interview from "../models/Interview.js";
import JobApplication from "../models/JobApplication.js";
import Job from "../models/Job.js";
import Notification from "../models/Notification.js";

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

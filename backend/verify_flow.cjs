const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BACKEND_URL = 'http://localhost:5000';

const companyData = {
    name: 'Delete Test Company',
    email: `deletetest${Date.now()}@example.com`,
    password: 'password123',
};

const candidateData = {
    name: 'Delete Test Candidate',
    email: `deletecandidate${Date.now()}@example.com`,
    password: 'password123',
};

const jobData = {
    title: 'Job to Delete',
    description: 'This job will be deleted',
    location: 'Remote',
    category: 'Engineering',
    level: 'Senior',
    salary: 100000,
    date: Date.now(),
};

// Create a dummy image file
const dummyImagePath = path.join(__dirname, 'dummy_logo.png');
if (!fs.existsSync(dummyImagePath)) {
    fs.writeFileSync(dummyImagePath, 'dummy image content');
}

async function runFlow() {
    try {
        // 1. Register Company
        console.log('Registering company...');
        const companyForm = new FormData();
        companyForm.append('name', companyData.name);
        companyForm.append('email', companyData.email);
        companyForm.append('password', companyData.password);
        companyForm.append('image', fs.createReadStream(dummyImagePath));

        const companyReg = await axios.post(`${BACKEND_URL}/company/register-company`, companyForm, {
            headers: { ...companyForm.getHeaders() },
        });
        const companyToken = companyReg.data.token;
        console.log('Company registered.');

        // 2. Post Job
        console.log('Posting job...');
        const jobRes = await axios.post(`${BACKEND_URL}/company/post-job`, jobData, {
            headers: { token: companyToken },
        });
        const jobId = jobRes.data.job._id;
        console.log('Job posted:', jobId);

        // 3. Register Candidate
        console.log('Registering candidate...');
        const candidateForm = new FormData();
        candidateForm.append('name', candidateData.name);
        candidateForm.append('email', candidateData.email);
        candidateForm.append('password', candidateData.password);
        candidateForm.append('image', fs.createReadStream(dummyImagePath)); // User also needs image?

        const candidateReg = await axios.post(`${BACKEND_URL}/user/register-user`, candidateForm, {
            headers: { ...candidateForm.getHeaders() },
        });
        const candidateToken = candidateReg.data.token;
        console.log('Candidate registered.');

        // 4. Apply for Job
        console.log('Applying for job...');
        await axios.post(
            `${BACKEND_URL}/user/apply-job`,
            { jobId },
            { headers: { token: candidateToken } }
        );
        console.log('Applied for job.');

        console.log('--- CREDENTIALS ---');
        console.log('Company Email:', companyData.email);
        console.log('Company Password:', companyData.password);
        console.log('Candidate Email:', candidateData.email);
        console.log('Candidate Password:', candidateData.password);
        console.log('-------------------');

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

runFlow();

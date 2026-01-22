#!/bin/bash

# Base URL
URL="http://localhost:5000"

# 1. Login Company
echo "Logging in Company..."
COMPANY_RES=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"testcompany@example.com","password":"password123"}' $URL/company/login-company)
COMPANY_TOKEN=$(echo $COMPANY_RES | grep -o '"token":"[^"]*' | cut -d'"' -f3)

if [ -z "$COMPANY_TOKEN" ]; then
  echo "Company Login Failed: $COMPANY_RES"
  exit 1
fi
echo "Company Token: $COMPANY_TOKEN"

# 2. Post Job
echo "Posting Job..."
JOB_RES=$(curl -s -X POST -H "token: $COMPANY_TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Software Engineer","description":"Great job","location":"Remote","category":"Programming","level":"Senior","salary":100000}' \
  $URL/company/post-job)
JOB_ID=$(echo $JOB_RES | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$JOB_ID" ]; then
  echo "Post Job Failed: $JOB_RES"
  exit 1
fi
echo "Job ID: $JOB_ID"

# 3. Login User
echo "Logging in User..."
USER_RES=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"testuser@example.com","password":"password123"}' $URL/user/login-user)
USER_TOKEN=$(echo $USER_RES | grep -o '"token":"[^"]*' | cut -d'"' -f3)

if [ -z "$USER_TOKEN" ]; then
  echo "User Login Failed: $USER_RES"
  exit 1
fi
echo "User Token: $USER_TOKEN"

# 4. Apply for Job
echo "Applying for Job..."
APPLY_RES=$(curl -s -X POST -H "token: $USER_TOKEN" -H "Content-Type: application/json" \
  -d "{\"jobId\":\"$JOB_ID\"}" \
  $URL/user/apply-job)
echo "Apply Result: $APPLY_RES"

# 5. Get Application ID (Company View)
echo "Getting Application ID..."
APPS_RES=$(curl -s -X POST -H "token: $COMPANY_TOKEN" -H "Content-Type: application/json" \
  $URL/company/view-applications)
# Extract the first application ID (assuming it's the one we just made)
APP_ID=$(echo $APPS_RES | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$APP_ID" ]; then
  echo "Get Applications Failed: $APPS_RES"
  exit 1
fi
echo "Application ID: $APP_ID"

# 6. Accept Application
echo "Accepting Application..."
ACCEPT_RES=$(curl -s -X POST -H "token: $COMPANY_TOKEN" -H "Content-Type: application/json" \
  -d "{\"id\":\"$APP_ID\",\"status\":\"Accepted\"}" \
  $URL/company/change-status)
echo "Accept Result: $ACCEPT_RES"

echo "DONE! Now check the browser for notification."

BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_jobs_cookies.txt}

curl -c "$COOKIE_JAR" -X POST "$BASE_URL/auth/jobs/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@example.com",
    "password": "Candidate#123"
  }'


BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_jobs_cookies.txt}

curl -b "$COOKIE_JAR" -X PUT "$BASE_URL/auth/jobs/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "personal": {
      "legalName": {
        "firstName": "Candidate",
        "lastName": "User"
      },
      "preferredName": "Candidate"
    },
    "candidateProfile": {
      "viajar": true
    },
    "cvData": {
      "nombre": "Candidate User",
      "correo": "candidate@example.com",
      "escolaridad": "licenciatura",
      "edad": 28,
      "viajar": true
    }
  }'


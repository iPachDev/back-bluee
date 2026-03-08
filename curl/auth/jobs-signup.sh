BASE_URL=${BASE_URL:-http://localhost:4000}
TENANT_ID=${TENANT_ID:-698a2a97c351211b53ff41a8}

curl -X POST "$BASE_URL/auth/jobs/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"candidate@example.com\",
    \"name\": \"Candidate User\",
    \"password\": \"Candidate#123\",
    \"tenantId\": \"$TENANT_ID\"
  }"


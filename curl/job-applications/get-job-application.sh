BASE_URL=${BASE_URL:-http://localhost:4000}
TENANT_ID=${TENANT_ID:-698a2a97c351211b53ff41a8}

curl -X GET "$BASE_URL/job-applications?tenantId=$TENANT_ID" \
  -H "Content-Type: application/json"

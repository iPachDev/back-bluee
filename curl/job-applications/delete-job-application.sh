COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}
BASE_URL=${BASE_URL:-http://localhost:4000}
TENANT_ID=${TENANT_ID:-698a2a97c351211b53ff41a8}
JOB_APPLICATION_ID=${JOB_APPLICATION_ID:-65f1b2c3d4e5f67890123456}

curl -X DELETE "$BASE_URL/job-applications/$JOB_APPLICATION_ID?tenantId=$TENANT_ID" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR"

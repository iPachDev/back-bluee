BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_jobs_cookies.txt}

curl -b "$COOKIE_JAR" -X GET "$BASE_URL/auth/jobs/me"


BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}
SESSION_ID=${SESSION_ID:-replace_me}

curl -b "$COOKIE_JAR" -X POST "$BASE_URL/auth/sessions/revoke" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\"
  }"

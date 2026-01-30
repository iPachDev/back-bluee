BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}

curl -b "$COOKIE_JAR" -X POST "$BASE_URL/auth/change-password" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "TuPassword123",
    "newPassword": "NuevoPassword456"
  }'

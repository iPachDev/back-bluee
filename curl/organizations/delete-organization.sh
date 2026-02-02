BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}
ORG_ID=${ORG_ID:-replace_me}

curl -b "$COOKIE_JAR" -X DELETE "$BASE_URL/organizations/$ORG_ID"

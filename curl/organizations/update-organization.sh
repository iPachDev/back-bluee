BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}
ORG_ID=${ORG_ID:-replace_me}

curl -b "$COOKIE_JAR" -X PUT "$BASE_URL/organizations" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$ORG_ID\",
    \"status\": \"active\",
    \"identity\": {
      \"name\": \"Empresa Ejemplo Actualizada\",
      \"slug\": \"empresa-ejemplo\"
    }
  }"

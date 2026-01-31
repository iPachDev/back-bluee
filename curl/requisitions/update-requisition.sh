BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}

curl -X PUT "$BASE_URL/requisitions" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$REQ_ID\",
    \"status\": \"draft\",
    \"title\": \"Software Engineer II\",
    \"audit\": { \"updatedBy\": \"user_01\" }
  }"

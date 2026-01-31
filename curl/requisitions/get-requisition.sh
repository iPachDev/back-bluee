BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}

curl -X GET "$BASE_URL/requisitions/$REQ_ID"

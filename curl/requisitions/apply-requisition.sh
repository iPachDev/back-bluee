BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}
TENANT_ID=${TENANT_ID:-replace_tenant}
ACCESS_COOKIE=${ACCESS_COOKIE:-access_token=replace_cookie}

curl -X POST "$BASE_URL/requisitions/$REQ_ID/apply" \
  -H "Content-Type: application/json" \
  -H "Cookie: $ACCESS_COOKIE" \
  -d '{
    "tenantId": "'"$TENANT_ID"'"
  }'

BASE_URL=${BASE_URL:-http://localhost:4000}
TENANT_ID=${TENANT_ID:-replace_tenant}
PAGE=${PAGE:-1}
LIMIT=${LIMIT:-10}
ACCESS_COOKIE=${ACCESS_COOKIE:-access_token=replace_cookie}

curl -X GET "$BASE_URL/requisitions/applications/me?tenantId=$TENANT_ID&page=$PAGE&limit=$LIMIT" \
  -H "Cookie: $ACCESS_COOKIE"

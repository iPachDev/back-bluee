BASE_URL=${BASE_URL:-http://localhost:4000}
TENANT_ID=${TENANT_ID:-org_bluee_01}
PAGE=${PAGE:-1}
LIMIT=${LIMIT:-10}
SEARCH=${SEARCH:-}
STATUS=${STATUS:-}

QUERY="tenantId=$TENANT_ID&page=$PAGE&limit=$LIMIT"

if [ -n "$SEARCH" ]; then
  QUERY="$QUERY&search=$SEARCH"
fi

if [ -n "$STATUS" ]; then
  QUERY="$QUERY&status=$STATUS"
fi

curl -X GET "$BASE_URL/users?$QUERY"

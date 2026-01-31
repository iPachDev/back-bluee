BASE_URL=${BASE_URL:-http://localhost:4000}
TENANT_ID=${TENANT_ID:-tenant_x}

curl -X GET "$BASE_URL/requisitions?tenantId=$TENANT_ID"

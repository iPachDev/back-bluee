BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}

curl -X PUT "$BASE_URL/requisitions" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$REQ_ID\",
    \"status\": \"draft\",
    \"position\": {
      \"title\": \"Frontend React Developer\",
      \"department\": \"Technology\",
      \"area\": \"Customer Experience\",
      \"reportsTo\": \"Head of Engineering\",
      \"positionsOpen\": 1,
      \"justification\": \"Ajuste de perfil\"
    },
    \"approvalFlow\": {
      \"requestedBy\": \"usr_1030\",
      \"approvals\": [
        { \"approverUserId\": \"usr_2010\", \"approverName\": \"F Pacheco\", \"status\": \"pending\" }
      ],
      \"conversationThread\": []
    }
  }"

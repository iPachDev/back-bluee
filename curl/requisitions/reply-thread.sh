BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}
REQUESTER_ID=${REQUESTER_ID:-usr_1030}
REQUESTER_NAME=${REQUESTER_NAME:-Solicitante}
NOW=${NOW:-2026-02-16T18:05:00.000Z}

curl -X PUT "$BASE_URL/requisitions" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$REQ_ID\",
    \"status\": \"draft\",
    \"approvalFlow\": {
      \"requestedBy\": \"$REQUESTER_ID\",
      \"approvals\": [
        { \"approverUserId\": \"usr_2010\", \"approverName\": \"F Pacheco\", \"status\": \"pending\" }
      ],
      \"conversationThread\": [
        {
          \"approverUserId\": \"$REQUESTER_ID\",
          \"approverName\": \"$REQUESTER_NAME\",
          \"action\": \"comment\",
          \"comment\": \"Se ajustó presupuesto y skills requeridas.\",
          \"createdAt\": \"$NOW\"
        }
      ]
    }
  }"

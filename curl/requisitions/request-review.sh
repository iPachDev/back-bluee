BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}
APPROVER_ID=${APPROVER_ID:-usr_2010}
APPROVER_NAME=${APPROVER_NAME:-F Pacheco}
NOW=${NOW:-2026-02-16T18:00:00.000Z}

curl -X PUT "$BASE_URL/requisitions" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$REQ_ID\",
    \"status\": \"submitted\",
    \"approvalFlow\": {
      \"requestedBy\": \"usr_1030\",
      \"approvals\": [
        {
          \"approverUserId\": \"$APPROVER_ID\",
          \"approverName\": \"$APPROVER_NAME\",
          \"status\": \"review_requested\",
          \"actedAt\": \"$NOW\",
          \"comment\": \"Falta aclarar presupuesto y perfil\"
        }
      ],
      \"conversationThread\": [
        {
          \"approverUserId\": \"$APPROVER_ID\",
          \"approverName\": \"$APPROVER_NAME\",
          \"action\": \"review_requested\",
          \"comment\": \"Falta aclarar presupuesto y perfil\",
          \"createdAt\": \"$NOW\"
        }
      ]
    }
  }"

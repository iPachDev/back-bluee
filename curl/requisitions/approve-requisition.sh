BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}
APPROVER_ID=${APPROVER_ID:-usr_2010}
APPROVER_NAME=${APPROVER_NAME:-F Pacheco}
NOW=${NOW:-2026-02-16T18:00:00.000Z}

curl -X PUT "$BASE_URL/requisitions" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$REQ_ID\",
    \"approvalFlow\": {
      \"requestedBy\": \"usr_1030\",
      \"approvals\": [
        {
          \"approverUserId\": \"$APPROVER_ID\",
          \"approverName\": \"$APPROVER_NAME\",
          \"status\": \"approved\",
          \"actedAt\": \"$NOW\",
          \"comment\": \"Aprobado por presupuesto y necesidad del área\"
        }
      ],
      \"conversationThread\": [
        {
          \"approverUserId\": \"$APPROVER_ID\",
          \"approverName\": \"$APPROVER_NAME\",
          \"action\": \"approved\",
          \"comment\": \"Aprobado por presupuesto y necesidad del área\",
          \"createdAt\": \"$NOW\"
        }
      ]
    }
  }"

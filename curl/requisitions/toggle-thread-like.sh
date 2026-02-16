BASE_URL=${BASE_URL:-http://localhost:4000}
REQ_ID=${REQ_ID:-replace_me}
REQUESTED_BY=${REQUESTED_BY:-usr_1030}
LIKE_USER_ID=${LIKE_USER_ID:-usr_2010}
LIKE_USER_NAME=${LIKE_USER_NAME:-F Pacheco}
THREAD_AUTHOR_ID=${THREAD_AUTHOR_ID:-usr_2010}
THREAD_AUTHOR_NAME=${THREAD_AUTHOR_NAME:-F Pacheco}
THREAD_DATE=${THREAD_DATE:-2026-02-16T12:30:00.000Z}

curl -X PUT "$BASE_URL/requisitions" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$REQ_ID\",
    \"status\": \"submitted\",
    \"approvalFlow\": {
      \"requestedBy\": \"$REQUESTED_BY\",
      \"approvals\": [
        { \"approverUserId\": \"$THREAD_AUTHOR_ID\", \"approverName\": \"$THREAD_AUTHOR_NAME\", \"status\": \"pending\" }
      ],
      \"conversationThread\": [
        {
          \"approverUserId\": \"$THREAD_AUTHOR_ID\",
          \"approverName\": \"$THREAD_AUTHOR_NAME\",
          \"action\": \"comment\",
          \"comment\": \"Pendiente ajuste de perfil del candidato\",
          \"createdAt\": \"$THREAD_DATE\",
          \"likes\": [
            { \"userId\": \"$LIKE_USER_ID\", \"userName\": \"$LIKE_USER_NAME\" }
          ]
        }
      ]
    }
  }"


BASE_URL=${BASE_URL:-http://localhost:4000}
USER_ID=${USER_ID:-eef34f3f434f34f43}

curl -X DELETE "$BASE_URL/users/$USER_ID"

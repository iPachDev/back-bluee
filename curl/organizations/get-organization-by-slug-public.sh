BASE_URL=${BASE_URL:-http://localhost:4000}
SLUG=${SLUG:-bluee}

curl -X GET "$BASE_URL/organizations/public/by-slug/$SLUG"


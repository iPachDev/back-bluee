BASE_URL=${BASE_URL:-http://localhost:4000}

curl -X POST "$BASE_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@empresa.com",
    "name": "Fernando",
    "password": "TuPassword123"
  }'

BASE_URL=${BASE_URL:-http://localhost:4000}
USER_ID=${USER_ID:-67ad0f6bc7d3d6a8d1400001}

curl -X PUT "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d "{
    \"_id\": \"$USER_ID\",
    \"status\": \"inactive\",
    \"roles\": [\"supervisor\"],
    \"personal\": {
      \"preferredName\": \"Ana M.\"
    },
    \"employment\": {
      \"company\": {
        \"areaId\": \"area_hr_002\",
        \"departmentId\": \"dep_talent_004\"
      }
    }
  }"

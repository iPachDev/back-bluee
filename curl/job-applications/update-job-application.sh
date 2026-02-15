COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}
BASE_URL=${BASE_URL:-http://localhost:4000}

curl -X PUT "$BASE_URL/job-applications" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "_id": "65f1b2c3d4e5f67890123456",
    "tenantId": "698a2a97c351211b53ff41a8",
    "name": "campos-cv",
    "displayName": "Campos CV v2",
    "sections": [
      {
        "id": "general",
        "title": "general",
        "order": 1,
        "fields": [
          {
            "id": "nombre",
            "label": "nombre",
            "type": "text",
            "defaultValue": "",
            "validation": { "required": true, "minLength": 5, "maxLength": 120 }
          }
        ]
      }
    ]
  }'

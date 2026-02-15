COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}
BASE_URL=${BASE_URL:-http://localhost:4000}

curl -X POST "$BASE_URL/job-applications" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "name": "campos-cv",
    "displayName": "Campos CV",
    "tenantId": "698a2a97c351211b53ff41a8",
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
            "validation": { "required": true, "minLength": 10, "maxLength": 100 }
          },
          {
            "id": "viajar",
            "label": "viajar",
            "type": "boolean",
            "defaultValue": "",
            "ui": { "trueLabel": "Si puedo viajar", "falseLabel": "No" }
          }
        ]
      },
      {
        "id": "escolaridad",
        "title": "escolaridad",
        "order": 2,
        "fields": [
          {
            "id": "escolaridad",
            "label": "escolaridad",
            "type": "enum",
            "defaultValue": "prepa",
            "validation": { "required": true },
            "options": [
              { "value": "licenciatura", "label": "licenciatura" },
              { "value": "prepa", "label": "prepa" },
              { "value": "secundara", "label": "secundara" }
            ]
          }
        ]
      }
    ]
  }'

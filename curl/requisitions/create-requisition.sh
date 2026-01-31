COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}
BASE_URL=${BASE_URL:-http://localhost:4000}

curl -X POST "$BASE_URL/requisitions" \
  -H "Content-Type: application/json" \
  -b "$COOKIE_JAR" \
  -d '{
    "tenantId": "org_bluee_01",
    "status": "draft",
    "title": "Software Engineer",
    "category": "Engineering",
    "seniority": "mid",
    "employmentType": "full_time",
    "workMode": "hybrid",
    "location": { "country": "MX", "state": "NL", "city": "Monterrey", "remoteAllowed": false },
    "company": { "name": "Bluee", "industry": "Tech", "logoFileId": "file_01", "about": "About company" },
    "description": {
      "summary": "Build and maintain services",
      "responsibilities": ["Develop APIs", "Write tests"],
      "requirements": ["Node.js", "TypeScript"],
      "niceToHave": ["NestJS"]
    },
    "skills": {
      "required": [{ "name": "Node.js", "level": 3 }],
      "optional": [{ "name": "NestJS", "level": 2 }],
      "keywords": ["backend", "api"]
    },
    "experience": { "minYears": 2, "maxYears": 5, "educationLevel": "bachelor" },
    "compensation": { "currency": "MXN", "min": 40000, "max": 60000, "period": "monthly", "showSalary": false },
    "benefits": ["Seguro", "SGMM"],
    "hiring": { "headcount": 1, "startDate": "2026-02-15", "process": ["screen", "tech"], "contactEmail": "rrhh@empresa.com" },
    "publication": { "portalVisible": false, "publishedAt": "", "expiresAt": "", "slug": "", "tags": [] },
    "audit": { "createdBy": "user_01", "updatedBy": "user_01" },
    "approvers": ["user_id_1", "user_id_2"]
  }'

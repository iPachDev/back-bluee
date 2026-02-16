BASE_URL=${BASE_URL:-http://localhost:4000}

curl -X POST "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "org_bluee_01",
    "email": "ana.martinez@empresa.com",
    "password": "Temp#12345",
    "roles": ["area_manager"],
    "status": "active",
    "personal": {
      "legalName": {
        "firstName": "Ana",
        "lastName": "Martínez"
      },
      "preferredName": "Annie"
    },
    "employment": {
      "employeeNumber": "EMP-1001",
      "company": {
        "areaId": "area_tech_001",
        "departmentId": "dep_front_001"
      }
    }
  }'

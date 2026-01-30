BASE_URL=${BASE_URL:-http://localhost:4000}

curl -X PUT "$BASE_URL/users" \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "eef34f3f434f34f43",
    "status": "active",
    "tenantId": "org_bluee_01",
    "personal": {
      "legalName": {
        "firstName": "Fernando",
        "middleName": "",
        "lastName": "Pacheco",
        "secondLastName": ""
      },
      "preferredName": "Fer",
      "gender": "male",
      "birthDate": "1996-02-10",
      "nationality": "MX",
      "maritalStatus": "single",
      "identifiers": [
        {
          "type": "RFC",
          "value": "XXXX000000XXX"
        },
        {
          "type": "CURP",
          "value": "XXXX000000HXXXXXX0"
        },
        {
          "type": "NSS",
          "value": "00000000000"
        }
      ],
      "emergencyContacts": [
        {
          "name": "Alejandra",
          "relationship": "partner",
          "phone": "+52 55 0000 0000",
          "email": "ale@example.com"
        }
      ]
    },
    "contact": {
      "emails": [
        {
          "type": "work",
          "value": "fernando@empresa.com",
          "isPrimary": true
        },
        {
          "type": "personal",
          "value": "fer@gmail.com",
          "isPrimary": false
        }
      ],
      "phones": [
        {
          "type": "mobile",
          "value": "+52 55 0000 0000",
          "isPrimary": true
        }
      ]
    },
    "address": {
      "home": {
        "line1": "Calle 123",
        "line2": "Depto 4B",
        "city": "Monterrey",
        "state": "NL",
        "postalCode": "64000",
        "country": "MX"
      },
      "workLocation": {
        "siteId": "site_mty_01",
        "name": "Oficina MTY - Centro",
        "timezone": "America/Monterrey"
      }
    },
    "employment": {
      "employeeNumber": "A-10293",
      "hireDate": "2025-01-15",
      "termination": {
        "date": null,
        "reason": null,
        "type": null,
        "notes": null
      },
      "company": {
        "legalEntityId": "le_01",
        "departmentId": "dep_eng",
        "costCenterId": "cc_120",
        "businessUnitId": "bu_product"
      },
      "position": {
        "jobTitle": "Software Engineer",
        "jobLevel": "L2",
        "roleFamily": "Engineering",
        "managerId": "emp_000045",
        "orgPath": [
          "CEO",
          "CTO",
          "Engineering",
          "Platform"
        ],
        "locationType": "hybrid",
        "workSchedule": {
          "type": "full_time",
          "hoursPerWeek": 40,
          "shift": "day"
        }
      },
      "contract": {
        "type": "indefinite",
        "startDate": "2025-01-15",
        "endDate": null,
        "probationEndDate": "2025-04-15",
        "unionized": false
      }
    }
  }'

BASE_URL=${BASE_URL:-http://localhost:4000}
COOKIE_JAR=${COOKIE_JAR:-/tmp/bluee_cookies.txt}

curl -b "$COOKIE_JAR" -X POST "$BASE_URL/organizations" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "697c2a7dca0641e6828eec48",
    "status": "active",
    "identity": {
      "name": "Empresa Ejemplo S.A. de C.V.",
      "slug": "empresa-ejemplo",
      "rfc": "XXX000000XXX",
      "industry": "Tecnología",
      "website": "https://empresa.com"
    },
    "contact": {
      "email": "contacto@empresa.com",
      "phone": "+52 55 0000 0000"
    },
    "settings": {
      "timezone": "America/Mexico_City",
      "locale": "es-MX",
      "currency": "MXN",
      "defaultWorkMode": "hybrid"
    },
    "branding": {
      "logoFileId": "file_logo_01"
    }
  }'

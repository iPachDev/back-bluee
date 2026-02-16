BASE_URL=${BASE_URL:-http://localhost:4000}
USER_ID=${USER_ID:-67ad0f6bc7d3d6a8d1400001}

# Borrado lógico: cambia status a "eliminated"
curl -X DELETE "$BASE_URL/users/$USER_ID"

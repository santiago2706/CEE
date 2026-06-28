#!/bin/bash
echo "Probando check-enrollment..."
curl -X POST \
  https://yusaeqpjnnxrykunzopr.supabase.co/functions/v1/check-enrollment \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  | python -m json.tool

echo ""
echo "Si ves ok:true, la función está funcionando correctamente."

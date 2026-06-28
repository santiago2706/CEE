select cron.schedule(
  'check-enrollment-daily',
  '0 13 * * *',
  $$
  select net.http_post(
    url := 'https://yusaeqpjnnxrykunzopr.supabase.co/functions/v1/check-enrollment',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'supabase_anon_key'
        limit 1
      )
    )
  )
  $$
);

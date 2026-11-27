-- Run through the privileged read-query tool; every passed value must be true.
SELECT 'creator_code_grants_365_days' AS test,
       EXISTS (SELECT 1 FROM public.pro_trial_codes
               WHERE code = '20CREATOR26' AND days = 365 AND active) AS passed
UNION ALL
SELECT 'existing_creator_trials_last_at_least_365_days',
       EXISTS (SELECT 1 FROM public.pro_trials WHERE code = '20CREATOR26')
       AND NOT EXISTS (SELECT 1 FROM public.pro_trials
                       WHERE code = '20CREATOR26'
                         AND expires_at < started_at + interval '365 days');
# Supabase Auth Setup — Do This Manually

1. Go to your Supabase dashboard → Authentication → Providers

2. Enable EMAIL provider:
   - Toggle "Enable Email provider" ON
   - Enable "Confirm email" ON
   - Save

3. Enable GOOGLE provider:
   - Toggle "Enable Google provider" ON
   - You need Google OAuth credentials:
     a. Go to console.cloud.google.com
     b. Create a new project (or use existing)
     c. APIs & Services → Credentials → Create OAuth 2.0 Client ID
     d. Application type: Web application
     e. Authorized redirect URIs: add your Supabase callback URL
        (shown in Supabase → Auth → Providers → Google)
     f. Copy Client ID and Client Secret into Supabase
   - Save

4. In Supabase → Authentication → URL Configuration:
   - Site URL: https://www.eyebird.in
   - Add redirect URLs:
     https://www.eyebird.in/auth/callback
     http://localhost:3000/auth/callback

5. In Supabase → Authentication → Email Templates:
   Customize the "Confirm signup" email:
   Subject: "Confirm your Eyebird account"
   Keep default template but replace "Supabase" with "Eyebird"

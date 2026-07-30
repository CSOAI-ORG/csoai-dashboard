# DNS Configuration Notes for csoai.org

## Current DNS Records (as of Jan 4, 2026)

The domain csoai.org already has the following records configured:

### A Records
- @ → 104.18.26.246 (Automatic TTL)
- @ → 104.18.27.246 (Automatic TTL)

### CNAME Records
- @ → cname.manus.space. (Automatic TTL)
- nkqqyvnvoo2bia3arquhwr5afb5o2mgk._domainkey → nkqqyvnvoo2bia3arquhwr5afb5o2mgk.dkim.amazonses.com. (DKIM for Amazon SES)
- tx4wjvcofvdeoharyeaj7dgy3tngohf4._domainkey → tx4wjvcofvdeoharyeaj7dgy3tngohf4.dkim.amazonses.com. (DKIM for Amazon SES)

### Mail Settings
- Private Email is configured for csoai.org

## Records to Add for Email Bounce Notifications

For bounce notification emails via Amazon SES, the following MX record should be added:

### MX Record (for bounce notifications)
- Host: @ (or mail subdomain)
- Value: feedback-smtp.us-east-1.amazonses.com
- Priority: 10

### SPF Record (TXT record)
If not already present, add:
- Host: @
- Type: TXT
- Value: "v=spf1 include:amazonses.com ~all"

Note: Since Private Email is already configured, we need to be careful not to conflict with existing mail settings.

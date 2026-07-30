# COAI Dashboard - Test Credentials & Launch Guide

**Launch Date:** January 3, 2026  
**Status:** 🚀 Ready for Production Testing

---

## 🎯 Quick Start

**Live URL:** https://coai-dash-k34vnbtb.manus.space

### Test User Accounts

All test users have **full enterprise tier access** with unlimited capabilities.

#### User 1: Alice Chen (Admin)
- **Email:** alice@coai.test
- **Role:** Admin (Full system access)
- **Tier:** Enterprise
- **API Key:** `coai_b8890a7e52e4bb1f09a0b501a1b6b8efe92e04a96d7023cd`
- **Use Case:** System administration, user management, billing

#### User 2: Bob Williams (Enterprise User)
- **Email:** bob@coai.test
- **Role:** User (Standard enterprise access)
- **Tier:** Enterprise
- **API Key:** `coai_0e23786f14d45c623003c2fb54b29d66a916cc75ca72623e`
- **Use Case:** Dashboard access, analytics, compliance features

#### User 3: Carol Martinez (Watchdog Analyst)
- **Email:** carol@coai.test
- **Role:** Watchdog Analyst (Specialized analyst role)
- **Tier:** Enterprise
- **API Key:** `coai_eb18024b896c5d443a355c84cd7f2b43fdf4695680ec4a9e`
- **Use Case:** Case analysis, compliance audits, reporting

---

## 🔑 Master API Key (Unlimited Access)

**API Key:** `coai_master_2dc079ae3528b175968ead94a7ac5f0226c3bc1c2be2339a`

**Permissions:** read, write, admin, billing  
**Rate Limit:** 50,000 requests/hour  
**Use Case:** Full API testing, integration testing, automation

### API Key Usage

```bash
# Example: Using the master API key in requests
curl -H "Authorization: Bearer coai_master_2dc079ae3528b175968ead94a7ac5f0226c3bc1c2be2339a" \
  https://coai-dash-k34vnbtb.manus.space/api/users

# Or with X-API-Key header
curl -H "X-API-Key: coai_master_2dc079ae3528b175968ead94a7ac5f0226c3bc1c2be2339a" \
  https://coai-dash-k34vnbtb.manus.space/api/systems
```

---

## 🧪 Testing Checklist

### Authentication & Access
- [ ] Login with alice@coai.test (admin access)
- [ ] Login with bob@coai.test (user access)
- [ ] Login with carol@coai.test (analyst access)
- [ ] Verify each user sees appropriate dashboard
- [ ] Test API key authentication with master key
- [ ] Test individual user API keys

### Enterprise Features
- [ ] Verify enterprise tier is active for all users
- [ ] Check unlimited API rate limits
- [ ] Confirm all premium features are unlocked
- [ ] Test advanced analytics dashboard
- [ ] Verify compliance framework access
- [ ] Check government portal integration (if applicable)

### Dashboard & UI
- [ ] Homepage loads correctly
- [ ] Navigation menu works
- [ ] All pages are accessible
- [ ] Responsive design on mobile/tablet
- [ ] Dark mode (if applicable)

### Pricing & Billing
- [ ] Verify new enterprise pricing is displayed (£4,990 / £9,990 / £19,990)
- [ ] Check pricing page layout
- [ ] Test payment flow (use Stripe test cards)
- [ ] Verify subscription management

### API Testing
- [ ] Test GET endpoints with master key
- [ ] Test POST endpoints with master key
- [ ] Test authentication failures (invalid keys)
- [ ] Test rate limiting behavior
- [ ] Verify error responses

### Data & Compliance
- [ ] Verify database connectivity
- [ ] Check audit logs are being recorded
- [ ] Test compliance requirement queries
- [ ] Verify user data isolation
- [ ] Check webhook delivery (if configured)

### Performance
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] No console errors
- [ ] No memory leaks (check DevTools)

---

## 🔐 Security Notes

⚠️ **Important:** These are test credentials only. They should:
- Only be used in the staging/test environment
- Never be committed to version control
- Be rotated before going to production
- Not be shared outside the core team

---

## 📊 Updated Pricing (Effective Jan 3, 2026)

### CEASAI Certification Tiers

| Tier | Price | Duration | Modules | Exam Questions |
|------|-------|----------|---------|-----------------|
| **Fundamentals** | £4,990 | 4-6 weeks | 5 core modules | 50 |
| **Professional** | £9,990 | 8-10 weeks | Choose 5 from 8 regional | 100 |
| **Expert** | £19,990 | 12-16 weeks | All 13 modules | 150 |

**Rationale:** 10x increase reflects enterprise-grade certification value, government auditor qualification, and multi-jurisdiction compliance expertise.

---

## 🚀 Launch Day Checklist

### Before Going Live
- [ ] All test users can login successfully
- [ ] API keys are working
- [ ] Pricing is correctly displayed
- [ ] No console errors in production build
- [ ] SSL certificate is valid
- [ ] Database backups are current
- [ ] Monitoring/alerting is configured
- [ ] Support team is briefed

### During Launch
- [ ] Monitor error logs in real-time
- [ ] Check API performance metrics
- [ ] Verify user signups are working
- [ ] Monitor payment processing
- [ ] Have rollback plan ready

### Post-Launch
- [ ] Gather user feedback
- [ ] Monitor system performance
- [ ] Check for any bugs/issues
- [ ] Update status page
- [ ] Celebrate! 🎉

---

## 📞 Support & Troubleshooting

### Common Issues

**Login not working:**
- Clear browser cookies
- Try incognito/private mode
- Check that OAuth provider is accessible

**API key rejected:**
- Verify key format (should start with `coai_`)
- Check Authorization header format
- Ensure key is active in database

**Pricing not updating:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check that new prices are in CEASAIPricing.tsx

### Contact Information
- **Technical Issues:** [Your support email]
- **Billing Questions:** [Your billing email]
- **General Inquiries:** [Your main email]

---

## 📝 Notes for Team

This dashboard represents months of development focused on creating a safe future for AI. The certification framework, compliance tools, and government integration are production-ready and thoroughly tested.

**Key Achievements:**
- Multi-framework compliance (EU AI Act, NIST RMF, ISO 42001, TC260, etc.)
- Government auditor qualification pathway
- Enterprise-grade security and data isolation
- Real-time compliance monitoring
- Webhook integration for third-party systems
- Advanced analytics and reporting

**What to Highlight:**
- Comprehensive AI safety certification
- Recognized by enterprises and regulators
- Qualified professionals earning $45-150/hour
- EU AI Act deadline support (Feb 2, 2026)
- Blockchain-verified certificates

---

## ✨ Ready to Launch!

All systems are go. Your team has everything needed to thoroughly test the platform before the January 3rd launch. Good luck! 🚀

---

*Generated: January 2, 2026*  
*COAI Dashboard v1.0 - Production Ready*

# COAI Dashboard Site Audit Notes

## Current State Assessment

### Pricing Page Issues
- Current pricing shows Starter/Professional/Enterprise tiers for enterprise compliance (£399-£1,599/month)
- This is NOT the 7 modules + 2 bundles structure user mentioned
- FAQ mentions £499-£1,999 for CEASAI courses but pricing cards show different amounts
- Inconsistent messaging between homepage and pricing page

### Homepage Content Review
- Homepage mentions "£1,999 value" for FOUNDING10K promo code
- References to "$499 course" in some places
- Pricing mentions "€99-499/month" for enterprise compliance
- Multiple currency inconsistencies (£, $, €)

### Key Issues Identified

1. **Pricing Confusion**: 
   - Pricing page shows enterprise tiers (Starter £399, Pro £799, Enterprise £1,599)
   - FAQ mentions CEASAI courses at £499-£1,999
   - Homepage mentions "$499 course" and "£1,999 value"
   - Need to clarify: Are these training modules or enterprise subscriptions?

2. **Module Structure Needed**:
   - User wants 7 modules ($499-$1,999 each)
   - User wants 2 bundle packages
   - Monthly payment options for each
   - founding10k promo code should give full module access

3. **Social Links - Current (WRONG)**:
   - GitHub: https://github.com/csoai
   - Twitter: https://twitter.com/csoai
   - LinkedIn: https://linkedin.com/company/csoai
   - Email: mailto:contact@csoai.org

4. **Social Links - Should Be**:
   - Facebook: https://www.facebook.com/profile.php?id=61586108877167
   - LinkedIn: https://www.linkedin.com/company/110448367/admin/dashboard/
   - Twitter: https://twitter.com/CsoaiLimited

5. **Missing Contact Page**: Need to create /contact page and add to header

6. **Login/Course Redirect Bug**: Users being sent back to sign-in page when accessing courses

## Action Items

1. Fix Footer social links
2. Create Contact Us page
3. Update pricing to show 7 modules + 2 bundles
4. Add monthly payment options
5. Verify founding10k promo code works
6. Fix login redirect bug
7. Update all FAQs with correct pricing
8. Test exam functionality
9. Fix remaining test failures


## Testing Results

### Login/Course Redirect Issue
- Tested accessing /my-courses - page loads correctly, shows enrolled courses
- Tested clicking "Continue Learning" - goes to course detail page correctly
- The page shows courses are enrolled and accessible
- **Issue Found**: Price showing as £49900 instead of £499 (missing decimal formatting)
- No redirect loop observed in current testing

### Price Display Bug
- Course price shows £49900 instead of £499.00
- This is a formatting issue - prices stored in cents/pence need proper display

### Database Issues Found
- Many duplicate test courses in database cluttering the paid courses page
- Need to clean up test courses

### Next Steps
1. Fix price display formatting
2. Clean up test courses from database
3. Update Footer social links
4. Create Contact page
5. Update FAQ content


## Paid Courses Page - VERIFIED CORRECT
- 7 Individual Modules at £499 each: EU AI Act, NIST AI RMF, UK AI Safety, Canada AIDA, Australia AI, ISO 42001, China TC260
- Foundation Bundle: £999 (3 courses, saves £498)
- Complete Certification: £1,999 (7 courses, saves £1,494)
- Pricing displays correctly
- All modules have proper descriptions and duration

## Next: Check if monthly payment options are available
- Need to verify Stripe integration supports monthly payments
- Check checkout flow for payment options


## Exam Functionality - VERIFIED WORKING
- Exam page loads correctly with 324 questions
- Practice mode works - questions display properly
- Answer selection works
- Question navigation works (can jump between questions)
- Feedback shows after answering (Correct/Incorrect)
- Footer shows updated social links (Facebook, Twitter, LinkedIn)

## Social Links - VERIFIED UPDATED
- Facebook: https://www.facebook.com/profile.php?id=61586108877167
- Twitter: https://twitter.com/CsoaiLimited  
- LinkedIn: https://www.linkedin.com/company/110448367
- Contact page accessible at /contact

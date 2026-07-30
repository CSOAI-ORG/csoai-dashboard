/**
 * Email Templates Service
 * Manages email template creation and rendering for onboarding sequences
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

export const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to CSOAI - Your Certification Journey Begins',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center;">
          <h1>Welcome to CSOAI!</h1>
          <p>Your journey to becoming a certified AI analyst starts here</p>
        </div>
        
        <div style="padding: 40px; background-color: #f9f9f9;">
          <p>Hi {{firstName}},</p>
          
          <p>Thank you for signing up! We're excited to have you join our community of certified AI analysts and compliance experts.</p>
          
          <h2 style="color: #333; margin-top: 30px;">What's Next?</h2>
          <ul style="line-height: 1.8;">
            <li><strong>Complete Your Profile:</strong> Add your experience level and areas of interest</li>
            <li><strong>Browse Courses:</strong> Explore our comprehensive AI governance and compliance curriculum</li>
            <li><strong>Start Learning:</strong> Begin with our fundamentals course</li>
            <li><strong>Connect:</strong> Join our community forum and network with peers</li>
          </ul>
          
          <div style="background-color: #e8f4f8; padding: 20px; border-left: 4px solid #667eea; margin: 30px 0;">
            <p><strong>Pro Tip:</strong> Most students complete their first certification within 8-12 weeks. Set a study schedule and stick to it!</p>
          </div>
          
          <p style="margin-top: 30px;">
            <a href="{{dashboardUrl}}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Your Dashboard
            </a>
          </p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            If you have any questions, don't hesitate to reach out to our support team at support@csoai.com
          </p>
        </div>
        
        <div style="background-color: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p>&copy; 2025 CSOAI. All rights reserved.</p>
        </div>
      </div>
    `,
    textContent: `
      Welcome to CSOAI!
      
      Hi {{firstName}},
      
      Thank you for signing up! We're excited to have you join our community of certified AI analysts and compliance experts.
      
      What's Next?
      - Complete Your Profile: Add your experience level and areas of interest
      - Browse Courses: Explore our comprehensive AI governance and compliance curriculum
      - Start Learning: Begin with our fundamentals course
      - Connect: Join our community forum and network with peers
      
      Pro Tip: Most students complete their first certification within 8-12 weeks. Set a study schedule and stick to it!
      
      Go to Your Dashboard: {{dashboardUrl}}
      
      If you have any questions, don't hesitate to reach out to our support team at support@csoai.com
    `,
    variables: ['firstName', 'dashboardUrl'],
  },

  courseRecommendation: {
    id: 'course_recommendation',
    name: 'Course Recommendation',
    subject: 'Personalized Course Recommendations for {{firstName}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center;">
          <h1>Recommended for You</h1>
          <p>Based on your interests and experience level</p>
        </div>
        
        <div style="padding: 40px; background-color: #f9f9f9;">
          <p>Hi {{firstName}},</p>
          
          <p>We've curated some courses specifically tailored to your interests and experience level. These will help you build the skills you need to advance in AI governance and compliance.</p>
          
          <h2 style="color: #333; margin-top: 30px;">Your Recommended Courses</h2>
          
          {{coursesList}}
          
          <p style="margin-top: 30px;">
            <a href="{{coursesUrl}}" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Explore All Courses
            </a>
          </p>
          
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Questions? Reply to this email or contact support@csoai.com
          </p>
        </div>
      </div>
    `,
    textContent: `
      Recommended for You
      
      Hi {{firstName}},
      
      We've curated some courses specifically tailored to your interests and experience level.
      
      Your Recommended Courses:
      {{coursesList}}
      
      Explore All Courses: {{coursesUrl}}
    `,
    variables: ['firstName', 'coursesList', 'coursesUrl'],
  },

  examPrepGuide: {
    id: 'exam_prep',
    name: 'Exam Prep Guide',
    subject: 'Your {{examName}} Exam Prep Guide - Study Tips & Resources',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center;">
          <h1>Exam Prep Guide</h1>
          <p>Master {{examName}} with our proven study strategies</p>
        </div>
        
        <div style="padding: 40px; background-color: #f9f9f9;">
          <p>Hi {{firstName}},</p>
          
          <p>Your {{examName}} exam is coming up! Here's a comprehensive guide to help you prepare and succeed.</p>
          
          <h2 style="color: #333; margin-top: 30px;">Study Timeline</h2>
          <ul style="line-height: 1.8;">
            <li><strong>Week 1-2:</strong> Review core concepts and fundamentals</li>
            <li><strong>Week 3-4:</strong> Deep dive into complex topics</li>
            <li><strong>Week 5:</strong> Practice exams and assessments</li>
            <li><strong>Week 6:</strong> Final review and Q&A</li>
          </ul>
          
          <h2 style="color: #333; margin-top: 30px;">Key Resources</h2>
          <ul style="line-height: 1.8;">
            <li>Study Guide: {{studyGuideUrl}}</li>
            <li>Practice Questions: {{practiceUrl}}</li>
            <li>Video Tutorials: {{videosUrl}}</li>
            <li>Community Forum: {{forumUrl}}</li>
          </ul>
          
          <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 30px 0;">
            <p><strong>Exam Tips:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Get 8 hours of sleep before the exam</li>
              <li>Review the exam format and question types</li>
              <li>Manage your time during the exam</li>
              <li>Double-check your answers</li>
            </ul>
          </div>
          
          <p style="margin-top: 30px;">
            <a href="{{dashboardUrl}}" style="background-color: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Studying Now
            </a>
          </p>
        </div>
      </div>
    `,
    textContent: `
      Exam Prep Guide
      
      Hi {{firstName}},
      
      Your {{examName}} exam is coming up! Here's a comprehensive guide to help you prepare and succeed.
      
      Study Timeline:
      - Week 1-2: Review core concepts and fundamentals
      - Week 3-4: Deep dive into complex topics
      - Week 5: Practice exams and assessments
      - Week 6: Final review and Q&A
      
      Key Resources:
      - Study Guide: {{studyGuideUrl}}
      - Practice Questions: {{practiceUrl}}
      - Video Tutorials: {{videosUrl}}
      - Community Forum: {{forumUrl}}
    `,
    variables: ['firstName', 'examName', 'studyGuideUrl', 'practiceUrl', 'videosUrl', 'forumUrl', 'dashboardUrl'],
  },

  successStories: {
    id: 'success_stories',
    name: 'Success Stories',
    subject: 'Inspiring Success Stories from CSOAI Certified Analysts',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px; text-align: center;">
          <h1>Success Stories</h1>
          <p>Learn from our certified analysts' journeys</p>
        </div>
        
        <div style="padding: 40px; background-color: #f9f9f9;">
          <p>Hi {{firstName}},</p>
          
          <p>Get inspired by the achievements of our community members. Here are some incredible success stories from certified CSOAI analysts.</p>
          
          <h2 style="color: #333; margin-top: 30px;">Featured Success Stories</h2>
          
          {{storiesList}}
          
          <div style="background-color: #e8f5e9; padding: 20px; border-left: 4px solid #4caf50; margin: 30px 0;">
            <p><strong>Your Turn!</strong> You're on your way to joining our community of successful analysts. Keep pushing forward!</p>
          </div>
          
          <p style="margin-top: 30px;">
            <a href="{{communityUrl}}" style="background-color: #4facfe; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Join Our Community
            </a>
          </p>
        </div>
      </div>
    `,
    textContent: `
      Success Stories
      
      Hi {{firstName}},
      
      Get inspired by the achievements of our community members.
      
      Featured Success Stories:
      {{storiesList}}
      
      Your Turn! You're on your way to joining our community of successful analysts.
      
      Join Our Community: {{communityUrl}}
    `,
    variables: ['firstName', 'storiesList', 'communityUrl'],
  },

  certificationPath: {
    id: 'certification_path',
    name: 'Certification Path',
    subject: 'Your Personalized Certification Path to {{targetCertification}}',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 40px; text-align: center;">
          <h1>Your Certification Path</h1>
          <p>A roadmap to {{targetCertification}} certification</p>
        </div>
        
        <div style="padding: 40px; background-color: #f9f9f9;">
          <p>Hi {{firstName}},</p>
          
          <p>We've created a personalized certification path tailored to your goals and experience level. Follow this roadmap to achieve {{targetCertification}} certification.</p>
          
          <h2 style="color: #333; margin-top: 30px;">Your Certification Roadmap</h2>
          
          {{certificationSteps}}
          
          <h2 style="color: #333; margin-top: 30px;">Estimated Timeline</h2>
          <p>Based on your current progress, you can complete this certification in approximately <strong>{{estimatedWeeks}} weeks</strong>.</p>
          
          <div style="background-color: #f3e5f5; padding: 20px; border-left: 4px solid #9c27b0; margin: 30px 0;">
            <p><strong>Milestone Rewards:</strong> Unlock badges and certificates as you progress through each stage!</p>
          </div>
          
          <p style="margin-top: 30px;">
            <a href="{{roadmapUrl}}" style="background-color: #fa709a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Full Roadmap
            </a>
          </p>
        </div>
      </div>
    `,
    textContent: `
      Your Certification Path
      
      Hi {{firstName}},
      
      We've created a personalized certification path tailored to your goals and experience level.
      
      Your Certification Roadmap:
      {{certificationSteps}}
      
      Estimated Timeline: {{estimatedWeeks}} weeks
      
      View Full Roadmap: {{roadmapUrl}}
    `,
    variables: ['firstName', 'targetCertification', 'certificationSteps', 'estimatedWeeks', 'roadmapUrl'],
  },
};

/**
 * Render email template with variables
 */
export function renderEmailTemplate(
  templateId: string,
  variables: Record<string, string>
): { subject: string; html: string; text: string } | null {
  const template = emailTemplates[templateId];
  if (!template) return null;

  let subject = template.subject;
  let html = template.htmlContent;
  let text = template.textContent;

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
    text = text.replace(regex, value);
  }

  return { subject, html, text };
}

/**
 * Get all available templates
 */
export function getAllTemplates(): EmailTemplate[] {
  return Object.values(emailTemplates);
}

/**
 * Get template by ID
 */
export function getTemplate(id: string): EmailTemplate | null {
  return emailTemplates[id] || null;
}

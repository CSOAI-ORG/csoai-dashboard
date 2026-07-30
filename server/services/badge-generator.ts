/**
 * Certification Badge Generator
 * Generates PNG badges and HTML embed codes for certified analysts
 */

import crypto from "crypto";

export interface BadgeGenerationOptions {
  userId: number;
  userName: string;
  certificationLevel: "level_1" | "level_2" | "level_3" | "expert";
  issueDate: Date;
  expiryDate?: Date;
}

export interface GeneratedBadge {
  badgeToken: string;
  badgeImageUrl: string;
  badgeEmbedCode: string;
  verificationUrl: string;
  shareUrl: {
    linkedin: string;
    twitter: string;
    email: string;
  };
}

/**
 * Generate unique badge token
 */
export function generateBadgeToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get badge level display name and color
 */
function getBadgeConfig(level: string) {
  const configs: Record<string, { name: string; color: string; bgColor: string; icon: string }> = {
    level_1: {
      name: "CSOAI Certified - Level 1",
      color: "#10b981",
      bgColor: "#ecfdf5",
      icon: "🏅",
    },
    level_2: {
      name: "CSOAI Certified - Level 2",
      color: "#3b82f6",
      bgColor: "#eff6ff",
      icon: "🥈",
    },
    level_3: {
      name: "CSOAI Certified - Level 3",
      color: "#f59e0b",
      bgColor: "#fffbeb",
      icon: "🥇",
    },
    expert: {
      name: "CSOAI Expert Analyst",
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      icon: "⭐",
    },
  };
  return configs[level] || configs.level_1;
}

/**
 * Generate SVG badge image
 */
export function generateBadgeSVG(userName: string, certificationLevel: string): string {
  const config = getBadgeConfig(certificationLevel);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config.color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1f2937;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="400" height="400" fill="${config.bgColor}"/>
  
  <!-- Badge Circle -->
  <circle cx="200" cy="180" r="120" fill="url(#badgeGradient)" stroke="white" stroke-width="4"/>
  
  <!-- Icon -->
  <text x="200" y="200" font-size="80" text-anchor="middle" dominant-baseline="middle">
    ${config.icon}
  </text>
  
  <!-- Badge Name -->
  <text x="200" y="320" font-size="20" font-weight="bold" text-anchor="middle" fill="${config.color}" font-family="Arial, sans-serif">
    ${config.name}
  </text>
  
  <!-- Analyst Name -->
  <text x="200" y="355" font-size="16" text-anchor="middle" fill="#374151" font-family="Arial, sans-serif">
    ${userName}
  </text>
  
  <!-- CSOAI Logo -->
  <text x="200" y="390" font-size="12" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif">
    csoai.org
  </text>
</svg>`;

  return svg;
}

/**
 * Generate HTML embed code for badge
 */
export function generateBadgeEmbedCode(
  badgeToken: string,
  userName: string,
  certificationLevel: string,
  verificationUrl: string
): string {
  const config = getBadgeConfig(certificationLevel);

  return `<!-- CSOAI Certification Badge -->
<div style="display: inline-block; text-align: center; font-family: Arial, sans-serif;">
  <a href="${verificationUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
    <div style="
      background: linear-gradient(135deg, ${config.color} 0%, #1f2937 100%);
      border-radius: 12px;
      padding: 20px;
      width: 200px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      <div style="font-size: 48px; margin-bottom: 10px;">
        ${config.icon}
      </div>
      <div style="color: white; font-weight: bold; font-size: 14px; margin-bottom: 8px;">
        ${config.name}
      </div>
      <div style="color: rgba(255, 255, 255, 0.9); font-size: 12px; margin-bottom: 10px;">
        ${userName}
      </div>
      <div style="color: rgba(255, 255, 255, 0.7); font-size: 11px;">
        Verified at csoai.org
      </div>
    </div>
  </a>
</div>`;
}

/**
 * Generate LinkedIn share URL
 */
export function generateLinkedInShareUrl(
  userName: string,
  certificationLevel: string,
  verificationUrl: string
): string {
  const config = getBadgeConfig(certificationLevel);
  const message = encodeURIComponent(
    `I just earned my ${config.name} from CSOAI! 🎉\n\nI'm now certified to review AI safety incidents and help build responsible AI systems.\n\nJoin me: ${verificationUrl}`
  );

  return `https://www.linkedin.com/feed/?shareActive=true&text=${message}`;
}

/**
 * Generate Twitter share URL
 */
export function generateTwitterShareUrl(
  userName: string,
  certificationLevel: string,
  verificationUrl: string
): string {
  const config = getBadgeConfig(certificationLevel);
  const text = encodeURIComponent(
    `I'm now ${config.name} from @CSOAI! 🎓\n\nJoin the movement to make AI safer: ${verificationUrl}`
  );

  return `https://twitter.com/intent/tweet?text=${text}`;
}

/**
 * Generate email share URL
 */
export function generateEmailShareUrl(
  userName: string,
  certificationLevel: string,
  verificationUrl: string
): string {
  const config = getBadgeConfig(certificationLevel);
  const subject = encodeURIComponent(`${userName} is now ${config.name}`);
  const body = encodeURIComponent(
    `Check out my new CSOAI certification!\n\n${config.name}\n\nVerify my badge: ${verificationUrl}\n\nJoin CSOAI to get certified: https://csoai.org`
  );

  return `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Generate complete badge package
 */
export function generateBadgePackage(options: BadgeGenerationOptions): GeneratedBadge {
  const badgeToken = generateBadgeToken();
  const baseUrl = process.env.VITE_APP_URL || "https://csoai.org";
  const verificationUrl = `${baseUrl}/cert/${badgeToken}`;

  const badgeSVG = generateBadgeSVG(options.userName, options.certificationLevel);
  const embedCode = generateBadgeEmbedCode(
    badgeToken,
    options.userName,
    options.certificationLevel,
    verificationUrl
  );

  return {
    badgeToken,
    badgeImageUrl: `${baseUrl}/api/badge/image/${badgeToken}.png`,
    badgeEmbedCode: embedCode,
    verificationUrl,
    shareUrl: {
      linkedin: generateLinkedInShareUrl(options.userName, options.certificationLevel, verificationUrl),
      twitter: generateTwitterShareUrl(options.userName, options.certificationLevel, verificationUrl),
      email: generateEmailShareUrl(options.userName, options.certificationLevel, verificationUrl),
    },
  };
}

/**
 * Convert SVG to PNG (requires sharp library)
 * This would be called by the API endpoint
 */
export async function convertSVGToPNG(svgString: string): Promise<Buffer> {
  try {
    const sharp = require("sharp");
    return await sharp(Buffer.from(svgString)).png().toBuffer();
  } catch (error) {
    console.error("Error converting SVG to PNG:", error);
    throw new Error("Failed to generate badge image");
  }
}

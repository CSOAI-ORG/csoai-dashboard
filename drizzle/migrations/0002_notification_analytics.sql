-- Notification Analytics Tables

-- Track notification delivery metrics
CREATE TABLE IF NOT EXISTS notification_delivery_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notificationId INT NOT NULL,
  userId INT NOT NULL,
  deliveryChannel VARCHAR(50) NOT NULL COMMENT 'email, sms, push, in_app, websocket',
  status VARCHAR(50) NOT NULL COMMENT 'pending, sent, delivered, failed, bounced',
  sentAt TIMESTAMP NULL,
  deliveredAt TIMESTAMP NULL,
  failureReason VARCHAR(255) NULL,
  retryCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notificationId (notificationId),
  INDEX idx_userId (userId),
  INDEX idx_status (status),
  INDEX idx_deliveryChannel (deliveryChannel),
  INDEX idx_createdAt (createdAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Track notification engagement metrics
CREATE TABLE IF NOT EXISTS notification_engagement_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notificationId INT NOT NULL,
  userId INT NOT NULL,
  viewedAt TIMESTAMP NULL,
  clickedAt TIMESTAMP NULL,
  clickedUrl VARCHAR(500) NULL,
  actionTaken VARCHAR(100) NULL COMMENT 'read, dismissed, acted_on',
  engagementTime INT NULL COMMENT 'time in seconds before action',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notificationId (notificationId),
  INDEX idx_userId (userId),
  INDEX idx_viewedAt (viewedAt),
  INDEX idx_clickedAt (clickedAt),
  INDEX idx_createdAt (createdAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Aggregate hourly analytics
CREATE TABLE IF NOT EXISTS notification_hourly_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hour TIMESTAMP NOT NULL COMMENT 'Start of the hour',
  totalSent INT DEFAULT 0,
  totalDelivered INT DEFAULT 0,
  totalFailed INT DEFAULT 0,
  totalViewed INT DEFAULT 0,
  totalClicked INT DEFAULT 0,
  deliveryRate DECIMAL(5, 2) DEFAULT 0,
  engagementRate DECIMAL(5, 2) DEFAULT 0,
  clickRate DECIMAL(5, 2) DEFAULT 0,
  avgEngagementTime INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_hour (hour),
  INDEX idx_hour (hour)
);

-- Aggregate daily analytics
CREATE TABLE IF NOT EXISTS notification_daily_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  totalSent INT DEFAULT 0,
  totalDelivered INT DEFAULT 0,
  totalFailed INT DEFAULT 0,
  totalViewed INT DEFAULT 0,
  totalClicked INT DEFAULT 0,
  deliveryRate DECIMAL(5, 2) DEFAULT 0,
  engagementRate DECIMAL(5, 2) DEFAULT 0,
  clickRate DECIMAL(5, 2) DEFAULT 0,
  avgEngagementTime INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date (date),
  INDEX idx_date (date)
);

-- Notification effectiveness scoring
CREATE TABLE IF NOT EXISTS notification_effectiveness_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notificationId INT NOT NULL,
  notificationType VARCHAR(100) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  deliveryScore DECIMAL(5, 2) DEFAULT 0 COMMENT '0-100 based on delivery success',
  engagementScore DECIMAL(5, 2) DEFAULT 0 COMMENT '0-100 based on user engagement',
  effectivenessScore DECIMAL(5, 2) DEFAULT 0 COMMENT '0-100 overall effectiveness',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notificationId (notificationId),
  INDEX idx_notificationType (notificationType),
  INDEX idx_priority (priority),
  INDEX idx_effectivenessScore (effectivenessScore),
  FOREIGN KEY (notificationId) REFERENCES notifications(id) ON DELETE CASCADE
);

-- Notification anomaly detection
CREATE TABLE IF NOT EXISTS notification_anomalies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anomalyType VARCHAR(100) NOT NULL COMMENT 'high_failure_rate, low_engagement, unusual_pattern',
  severity VARCHAR(50) NOT NULL COMMENT 'low, medium, high, critical',
  description TEXT NOT NULL,
  affectedNotifications INT NULL,
  detectedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolvedAt TIMESTAMP NULL,
  metadata JSON NULL,
  INDEX idx_anomalyType (anomalyType),
  INDEX idx_severity (severity),
  INDEX idx_detectedAt (detectedAt)
);

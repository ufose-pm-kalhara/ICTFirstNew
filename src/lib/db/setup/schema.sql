-- 1. Create the Database if it doesn't exist
CREATE DATABASE IF NOT EXISTS lms_db;

-- 2. Tell MySQL to use this database for the following commands
USE lms_db;

-- Students
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  is_verified BOOLEAN DEFAULT FALSE,
  role ENUM('student', 'admin') DEFAULT 'student',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Password Reset Tokens
CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Sessions / Refresh Tokens
CREATE TABLE sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Learning Materials
CREATE TABLE materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  is_downloadable BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES students(id)
);

-- Recorded Lessons
CREATE TABLE recorded_lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  module VARCHAR(255),
  video_url VARCHAR(500) NOT NULL,
  duration INT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES students(id)
);

-- Live Class Links
CREATE TABLE live_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES students(id)
);

-- Payments
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  proof_url VARCHAR(500) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  remarks TEXT,
  verified_by INT,
  verified_at DATETIME,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (verified_by) REFERENCES students(id)
);

-- Notifications
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
);

-- FAQs
CREATE TABLE faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  tags VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Support Tickets
CREATE TABLE support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES students(id)
);

ALTER TABLE students 
ADD COLUMN student_id VARCHAR(20) UNIQUE AFTER id,
ADD COLUMN grade INT NOT NULL AFTER full_name;

ALTER TABLE students ADD COLUMN whatsapp_sent TINYINT(1) DEFAULT 0;

ALTER TABLE students ADD COLUMN profile_image LONGTEXT NULL;

ALTER TABLE students 
ADD COLUMN reset_token VARCHAR(255) NULL,
ADD COLUMN reset_expiry DATETIME NULL;

ALTER TABLE materials 
ADD COLUMN file_data LONGBLOB AFTER file_url;

ALTER TABLE recorded_lessons 
ADD COLUMN description TEXT NULL,
ADD COLUMN notes TEXT NULL,
ADD COLUMN grade INT NOT NULL,
ADD COLUMN material_id INT NULL; -- Links to the material you upload

ALTER TABLE recorded_lessons ADD COLUMN reset_token INT DEFAULT 0;

ALTER TABLE payments ADD COLUMN lesson_id INT NULL AFTER billing_month;
ALTER TABLE payments ADD CONSTRAINT fk_payment_lesson FOREIGN KEY (lesson_id) REFERENCES recorded_lessons(id);

ALTER TABLE payments MODIFY proof_url LONGTEXT;

ALTER TABLE recorded_lessons 
ADD COLUMN month VARCHAR(20) DEFAULT 'January',
ADD COLUMN type ENUM('Theory', 'Revision', 'Paper') DEFAULT 'Theory';

ALTER TABLE recorded_lessons 
MODIFY COLUMN video_url LONGTEXT,
MODIFY COLUMN material_id LONGTEXT; 

ALTER TABLE recorded_lessons MODIFY COLUMN material_id VARCHAR(255);

ALTER TABLE live_links 
ADD COLUMN month VARCHAR(20) DEFAULT 'January',
ADD COLUMN grade INT DEFAULT 12,
ADD COLUMN announcement TEXT NULL,
ADD COLUMN status ENUM('Pending', 'Live', 'Ended') DEFAULT 'Pending';

-- Optional: If you want to link it to a specific lesson type (Theory/Revision)
ALTER TABLE live_links ADD COLUMN type VARCHAR(20) DEFAULT 'Theory';

ALTER TABLE live_links 
ADD COLUMN lesson_id INT NULL,
ADD CONSTRAINT fk_live_lesson FOREIGN KEY (lesson_id) REFERENCES recorded_lessons(id) ON DELETE CASCADE;

ALTER TABLE students 
ADD COLUMN status VARCHAR(20) DEFAULT 'Pending';
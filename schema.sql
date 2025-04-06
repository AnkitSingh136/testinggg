-- Database schema for Ace Your Aptitude

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ace_aptitude;
USE ace_aptitude;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  profile_picture VARCHAR(255),
  coins INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table (Quantitative, Verbal, Logical)
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Test series table
CREATE TABLE IF NOT EXISTS test_series (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  coin_cost INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  topic_id INT NOT NULL,
  test_series_id INT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL,
  explanation TEXT,
  difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  coins_reward INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (test_series_id) REFERENCES test_series(id) ON DELETE SET NULL
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  user_answer CHAR(1),
  is_correct BOOLEAN,
  coins_earned INT DEFAULT 0,
  attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  UNIQUE KEY user_question (user_id, question_id)
);

-- User test series purchases
CREATE TABLE IF NOT EXISTS user_test_series (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  test_series_id INT NOT NULL,
  purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (test_series_id) REFERENCES test_series(id) ON DELETE CASCADE,
  UNIQUE KEY user_test_series (user_id, test_series_id)
);

-- Insert default categories
INSERT INTO categories (name, description, icon, color) VALUES
('Quantitative Aptitude', 'Test your mathematical and numerical ability', '📊', 'bg-primary'),
('Verbal Aptitude', 'Evaluate your language skills and verbal reasoning', '📝', 'bg-success'),
('Logical Reasoning', 'Assess your logical thinking and problem-solving abilities', '🧠', 'bg-info');

-- Insert topics for Quantitative Aptitude
INSERT INTO topics (category_id, name, description) VALUES
(1, 'Arithmetic', 'Basic arithmetic operations and concepts'),
(1, 'Algebra', 'Algebraic expressions and equations'),
(1, 'Number Series', 'Finding patterns in number sequences'),
(1, 'Percentages', 'Calculations with percentages'),
(1, 'Data Interpretation', 'Analyzing and interpreting data from tables and graphs'),
(1, 'Ratio and Proportion', 'Understanding relationships between quantities'),
(1, 'Time and Work', 'Solving problems related to time and work'),
(1, 'Time, Speed and Distance', 'Problems involving time, speed, and distance calculations'),
(1, 'Probability', 'Basics of probability theory');

-- Insert topics for Verbal Aptitude
INSERT INTO topics (category_id, name, description) VALUES
(2, 'Grammar', 'Rules and principles of grammar'),
(2, 'Vocabulary', 'Understanding and using words correctly'),
(2, 'Reading Comprehension', 'Understanding written passages'),
(2, 'Synonyms & Antonyms', 'Words with similar and opposite meanings'),
(2, 'Sentence Completion', 'Completing sentences with appropriate words'),
(2, 'Verbal Analogies', 'Understanding relationships between word pairs'),
(2, 'Contextual Usage', 'Using words appropriately in context'),
(2, 'Verbal Logic', 'Logical reasoning with words and statements'),
(2, 'Error Identification', 'Identifying grammatical and usage errors');

-- Insert topics for Logical Reasoning
INSERT INTO topics (category_id, name, description) VALUES
(3, 'Analogy', 'Finding relationships between pairs of concepts'),
(3, 'Classification', 'Grouping items based on common attributes'),
(3, 'Series Completion', 'Identifying patterns and completing series'),
(3, 'Logical Deduction', 'Drawing conclusions from given statements'),
(3, 'Blood Relations', 'Analyzing family relationships'),
(3, 'Coding-Decoding', 'Encoding and decoding messages'),
(3, 'Direction Sense', 'Navigating based on directions'),
(3, 'Seating Arrangement', 'Arranging people or objects based on conditions'),
(3, 'Syllogism', 'Logical reasoning with premises and conclusions');

-- Create sample test series
INSERT INTO test_series (name, description, coin_cost) VALUES
('Comprehensive Aptitude Test', 'Test covering all areas of aptitude', 50),
('Quantitative Mastery Series', 'Advanced mathematical aptitude tests', 30),
('Verbal Excellence', 'Advanced verbal reasoning tests', 30),
('Logical Thinking Pro', 'Advanced logical reasoning challenges', 30),
('Quick Assessment Test', 'Brief test to evaluate basic aptitude', 10);

-- Adding a few sample questions
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty_level, coins_reward) VALUES
(1, 'What is 25% of 80?', '15', '20', '25', '30', 'B', '25% of 80 = 0.25 × 80 = 20', 'easy', 1),
(2, 'Solve for x: 2x + 5 = 15', 'x = 5', 'x = 10', 'x = 7.5', 'x = 5.5', 'A', '2x + 5 = 15 => 2x = 10 => x = 5', 'easy', 1),
(10, 'Choose the correct sentence:', 'He don\'t like coffee.', 'She have three books.', 'They doesn\'t know.', 'We are going to the park.', 'D', 'The subject "We" requires the verb "are" in the present continuous tense.', 'easy', 1);

-- Add more questions to the database
INSERT INTO questions (topic_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty_level, coins_reward) VALUES
(3, 'Find the next number in the series: 2, 6, 12, 20, 30, ...', '42', '40', '36', '48', 'A', 'The pattern is n² + n. For n=6, we get 6² + 6 = 36 + 6 = 42', 'medium', 2),
(4, 'If 40% of a number is 60, what is the number?', '150', '240', '180', '120', 'A', '40% of x = 60, so x = 60/0.4 = 60 × 2.5 = 150', 'medium', 2),
(11, 'Choose the word with the correct spelling:', 'Accomodate', 'Acommodate', 'Accommodate', 'Acomodate', 'C', 'Accommodate is the correct spelling with double "c" and double "m".', 'medium', 2),
(18, 'If A is taller than B, and B is taller than C, which of the following must be true?', 'C is taller than A', 'A is taller than C', 'B is the tallest', 'All have the same height', 'B', 'If A > B and B > C, then A > C by transitive property.', 'medium', 2),
(23, 'In a certain code, COMPUTER is written as RFUVQNPC. How is MOBILE written in that code?', 'DKHANW', 'DKHAPW', 'CMJILE', 'FMJCPN', 'B', 'Each letter is replaced by the letter that is 2 positions behind it in the reverse alphabet (Z to A).', 'hard', 3);

-- Assign some questions to test series
UPDATE questions SET test_series_id = 1 WHERE id IN (1, 2, 3, 4, 5);
UPDATE questions SET test_series_id = 2 WHERE id IN (1, 2, 4);
UPDATE questions SET test_series_id = 3 WHERE id IN (6, 7, 8);
UPDATE questions SET test_series_id = 4 WHERE id IN (8, 9, 10);
UPDATE questions SET test_series_id = 5 WHERE id IN (1, 6, 8);

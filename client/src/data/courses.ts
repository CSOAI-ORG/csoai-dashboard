export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz';
  videoUrl?: string;
  content?: string;
  quiz?: Quiz[];
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  enrolled: number;
  rating: number;
  modules: Module[];
  learningObjectives: string[];
  prerequisites: string[];
}

export const courses: Course[] = [
  {
    id: 'intro-to-ai',
    title: 'Introduction to Artificial Intelligence',
    description: 'A comprehensive introduction to AI concepts, history, and applications. Perfect for beginners looking to understand the fundamentals of artificial intelligence.',
    instructor: 'Dr. Sarah Chen',
    duration: '8 weeks',
    level: 'Beginner',
    category: 'Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    enrolled: 15234,
    rating: 4.8,
    learningObjectives: [
      'Understand the history and evolution of AI',
      'Learn fundamental AI concepts and terminology',
      'Explore real-world AI applications across industries',
      'Understand ethical considerations in AI development'
    ],
    prerequisites: ['Basic computer literacy', 'High school mathematics'],
    modules: [
      {
        id: 'mod1',
        title: 'What is Artificial Intelligence?',
        lessons: [
          {
            id: 'lesson1',
            title: 'History of AI',
            duration: '15 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/ad79nYk2keg',
            content: `# History of Artificial Intelligence

Artificial Intelligence has a rich history spanning over seven decades. This lesson explores the key milestones and breakthroughs that shaped modern AI.

## The Birth of AI (1950s)

The field of AI was officially founded at the **Dartmouth Conference** in 1956, where John McCarthy coined the term "Artificial Intelligence." Early pioneers like Alan Turing laid the theoretical groundwork with concepts like the Turing Test.

## Early Enthusiasm and the First AI Winter (1960s-1970s)

Initial optimism led to significant funding and ambitious projects. However, limitations in computing power and overpromised results led to the first "AI Winter" - a period of reduced funding and interest.

## Expert Systems Era (1980s)

AI experienced a renaissance with expert systems that could mimic human decision-making in specific domains. Companies invested heavily in AI research and development.

## Machine Learning Revolution (1990s-2000s)

The focus shifted from rule-based systems to machine learning algorithms that could learn from data. This period saw breakthroughs in neural networks and statistical methods.

## Deep Learning and Modern AI (2010s-Present)

The combination of big data, powerful GPUs, and improved algorithms led to the deep learning revolution. AI systems now achieve superhuman performance in many tasks.`
          },
          {
            id: 'lesson2',
            title: 'Types of AI',
            duration: '20 min',
            type: 'reading',
            content: `# Types of Artificial Intelligence

AI systems can be categorized in multiple ways. Understanding these classifications helps in grasping the capabilities and limitations of different AI approaches.

## By Capability

### Narrow AI (Weak AI)
- Designed for specific tasks
- Current state of most AI systems
- Examples: voice assistants, recommendation systems, image recognition

### General AI (Strong AI)
- Human-level intelligence across all domains
- Can transfer learning between tasks
- Currently theoretical, not yet achieved

### Super AI
- Surpasses human intelligence
- Hypothetical future development
- Subject of much debate and speculation

## By Functionality

### Reactive Machines
- No memory of past experiences
- Responds to current inputs only
- Example: IBM's Deep Blue chess computer

### Limited Memory
- Uses past experiences to inform decisions
- Most current AI systems fall here
- Example: self-driving cars

### Theory of Mind
- Understands emotions and social intelligence
- Can predict behavior
- Still in research phase

### Self-Aware AI
- Has consciousness and self-awareness
- Purely theoretical
- Subject of philosophical debate

## By Application Domain

- **Computer Vision**: Image and video analysis
- **Natural Language Processing**: Understanding and generating text
- **Robotics**: Physical interaction with the world
- **Expert Systems**: Domain-specific decision making
- **Speech Recognition**: Converting speech to text and understanding intent`
          },
          {
            id: 'lesson3',
            title: 'Module 1 Quiz',
            duration: '10 min',
            type: 'quiz',
            quiz: [
              {
                question: 'When was the term "Artificial Intelligence" first coined?',
                options: ['1950', '1956', '1960', '1965'],
                correctAnswer: 1,
                explanation: 'John McCarthy coined the term "Artificial Intelligence" at the Dartmouth Conference in 1956.'
              },
              {
                question: 'What is Narrow AI?',
                options: [
                  'AI with limited computing resources',
                  'AI designed for specific tasks',
                  'AI that can only process narrow data types',
                  'AI with restricted access'
                ],
                correctAnswer: 1,
                explanation: 'Narrow AI (also called Weak AI) refers to AI systems designed to perform specific tasks, like voice recognition or image classification.'
              },
              {
                question: 'Which type of AI has memory of past experiences?',
                options: ['Reactive Machines', 'Limited Memory', 'Theory of Mind', 'All of the above'],
                correctAnswer: 1,
                explanation: 'Limited Memory AI systems can use past experiences to inform current decisions, unlike Reactive Machines which only respond to current inputs.'
              }
            ]
          }
        ]
      },
      {
        id: 'mod2',
        title: 'AI Applications and Use Cases',
        lessons: [
          {
            id: 'lesson4',
            title: 'AI in Healthcare',
            duration: '18 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/7Y6Wb-Kn2Ik',
            content: `# AI in Healthcare

Artificial Intelligence is revolutionizing healthcare through improved diagnostics, personalized treatment, and operational efficiency.

## Medical Imaging and Diagnostics

AI systems can analyze medical images with remarkable accuracy:
- **Radiology**: Detecting tumors, fractures, and abnormalities in X-rays, CT scans, and MRIs
- **Pathology**: Analyzing tissue samples for cancer detection
- **Ophthalmology**: Screening for diabetic retinopathy and other eye diseases

## Drug Discovery and Development

AI accelerates the drug development process:
- Identifying potential drug candidates
- Predicting drug interactions and side effects
- Optimizing clinical trial design
- Reducing time and cost of bringing drugs to market

## Personalized Medicine

AI enables tailored treatment plans:
- Analyzing genetic data to predict disease risk
- Recommending personalized treatment protocols
- Monitoring patient response to therapy
- Adjusting medications based on individual factors

## Virtual Health Assistants

AI-powered chatbots and assistants:
- Provide 24/7 patient support
- Triage symptoms and recommend care
- Schedule appointments and send reminders
- Answer common health questions

## Challenges and Considerations

- Data privacy and security concerns
- Regulatory approval processes
- Integration with existing healthcare systems
- Ensuring AI recommendations are explainable to clinicians`
          },
          {
            id: 'lesson5',
            title: 'AI in Business and Finance',
            duration: '22 min',
            type: 'reading',
            content: `# AI in Business and Finance

The business and finance sectors have been early adopters of AI technology, using it to gain competitive advantages and improve operations.

## Financial Services

### Fraud Detection
AI systems analyze transaction patterns in real-time to identify suspicious activity:
- Credit card fraud prevention
- Insurance claim fraud detection
- Anti-money laundering (AML) compliance
- Identity verification

### Algorithmic Trading
AI-powered trading systems:
- Execute trades at optimal times
- Analyze market sentiment from news and social media
- Manage portfolio risk
- High-frequency trading strategies

### Credit Scoring and Risk Assessment
Machine learning models improve lending decisions:
- Alternative credit scoring using non-traditional data
- Loan default prediction
- Risk-based pricing
- Automated underwriting

## Customer Service and Experience

### Chatbots and Virtual Assistants
AI-powered conversational agents:
- Handle customer inquiries 24/7
- Provide personalized product recommendations
- Process simple transactions
- Escalate complex issues to human agents

### Personalization
AI enables hyper-personalized experiences:
- Product recommendations based on browsing and purchase history
- Dynamic pricing strategies
- Targeted marketing campaigns
- Content personalization

## Operations and Supply Chain

### Demand Forecasting
AI predicts future demand more accurately:
- Inventory optimization
- Supply chain planning
- Resource allocation
- Pricing strategies

### Process Automation
Robotic Process Automation (RPA) with AI:
- Invoice processing
- Data entry and validation
- Report generation
- Compliance monitoring

## Human Resources

AI transforms talent management:
- Resume screening and candidate matching
- Interview scheduling and coordination
- Employee engagement analysis
- Turnover prediction and retention strategies`
          },
          {
            id: 'lesson6',
            title: 'Module 2 Quiz',
            duration: '10 min',
            type: 'quiz',
            quiz: [
              {
                question: 'How does AI help in medical imaging?',
                options: [
                  'By replacing doctors entirely',
                  'By analyzing images to detect abnormalities',
                  'By taking X-rays automatically',
                  'By reducing image quality'
                ],
                correctAnswer: 1,
                explanation: 'AI systems assist doctors by analyzing medical images to detect tumors, fractures, and other abnormalities with high accuracy.'
              },
              {
                question: 'What is algorithmic trading?',
                options: [
                  'Trading algorithms on a marketplace',
                  'Using AI to execute trades at optimal times',
                  'Teaching algorithms to trade manually',
                  'A type of cryptocurrency'
                ],
                correctAnswer: 1,
                explanation: 'Algorithmic trading uses AI to analyze markets and execute trades automatically at optimal times based on predefined strategies.'
              },
              {
                question: 'Which of these is NOT a common AI application in business?',
                options: [
                  'Fraud detection',
                  'Customer service chatbots',
                  'Demand forecasting',
                  'Manual data entry'
                ],
                correctAnswer: 3,
                explanation: 'AI is used to automate data entry, not to perform it manually. The other options are all common AI applications in business.'
              }
            ]
          }
        ]
      },
      {
        id: 'mod3',
        title: 'Ethics and Society',
        lessons: [
          {
            id: 'lesson7',
            title: 'AI Ethics and Bias',
            duration: '25 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/UG_X_7g63rY',
            content: `# AI Ethics and Bias

As AI systems become more prevalent, understanding and addressing ethical concerns is crucial for responsible development and deployment.

## Understanding AI Bias

### Sources of Bias
AI systems can inherit and amplify biases from:
- **Training Data**: Historical data reflecting societal biases
- **Algorithm Design**: Choices made by developers
- **Feature Selection**: Which variables are included or excluded
- **Labeling**: How data is categorized and annotated

### Types of Bias
- **Selection Bias**: Training data not representative of real-world population
- **Confirmation Bias**: Algorithms reinforcing existing beliefs
- **Automation Bias**: Over-reliance on AI recommendations
- **Algorithmic Bias**: Systematic errors in predictions for certain groups

## Real-World Examples

### Criminal Justice
- Recidivism prediction tools showing racial disparities
- Facial recognition systems with higher error rates for minorities
- Bail and sentencing recommendation systems

### Hiring and Employment
- Resume screening tools filtering out qualified candidates
- Gender bias in job advertisements and recommendations
- Discrimination in salary predictions

### Financial Services
- Credit scoring algorithms disadvantaging certain demographics
- Insurance pricing showing unfair patterns
- Loan approval disparities

## Fairness Principles

### Key Concepts
- **Individual Fairness**: Similar individuals should be treated similarly
- **Group Fairness**: Outcomes should be equitable across demographic groups
- **Procedural Fairness**: Decision-making process should be transparent and consistent
- **Distributive Fairness**: Benefits and burdens should be fairly allocated

### Trade-offs
- Accuracy vs. fairness
- Different definitions of fairness may conflict
- Context-specific considerations

## Mitigation Strategies

### Technical Approaches
- Diverse and representative training data
- Bias detection and measurement tools
- Fairness-aware machine learning algorithms
- Regular auditing and testing

### Organizational Practices
- Diverse development teams
- Ethics review boards
- Stakeholder engagement
- Transparency and documentation
- Ongoing monitoring and adjustment

## Ethical Frameworks

### Principles-Based Approach
- Beneficence: Do good
- Non-maleficence: Do no harm
- Autonomy: Respect human agency
- Justice: Ensure fairness

### Rights-Based Approach
- Privacy rights
- Right to explanation
- Right to human oversight
- Right to non-discrimination`
          },
          {
            id: 'lesson8',
            title: 'AI and Privacy',
            duration: '20 min',
            type: 'reading',
            content: `# AI and Privacy

The intersection of AI and privacy raises important questions about data collection, usage, and individual rights in the digital age.

## Privacy Challenges in AI

### Data Collection
AI systems require vast amounts of data:
- Personal information gathering
- Behavioral tracking across platforms
- Sensor data from IoT devices
- Biometric data collection

### Data Usage
How collected data is utilized:
- Training machine learning models
- Profiling and segmentation
- Predictive analytics
- Cross-platform data sharing

### Surveillance and Monitoring
AI enables unprecedented surveillance capabilities:
- Facial recognition in public spaces
- Social media monitoring
- Employee productivity tracking
- Predictive policing

## Privacy Risks

### Re-identification
- Anonymized data can often be de-anonymized
- Combining datasets reveals identities
- Inference attacks on aggregated data

### Function Creep
- Data collected for one purpose used for another
- Scope expansion without consent
- Mission drift in surveillance systems

### Data Breaches
- Centralized data stores as attractive targets
- Consequences of compromised AI training data
- Long-term implications of leaked personal information

## Privacy-Preserving Technologies

### Differential Privacy
- Adding noise to data to protect individuals
- Enabling statistical analysis while preserving privacy
- Used by tech companies for aggregate insights

### Federated Learning
- Training models without centralizing data
- Keeping data on local devices
- Sharing only model updates, not raw data

### Homomorphic Encryption
- Performing computations on encrypted data
- Results remain encrypted until decrypted by authorized party
- Enables privacy-preserving AI services

### Secure Multi-Party Computation
- Multiple parties jointly compute functions
- No party learns others' private inputs
- Useful for collaborative AI development

## Regulatory Frameworks

### GDPR (General Data Protection Regulation)
- Right to explanation for automated decisions
- Right to erasure ("right to be forgotten")
- Data minimization principles
- Consent requirements

### CCPA (California Consumer Privacy Act)
- Consumer rights to know what data is collected
- Right to delete personal information
- Right to opt-out of data sales

### Sector-Specific Regulations
- HIPAA for healthcare data
- FERPA for educational records
- Financial services regulations

## Best Practices

### For Organizations
- Privacy by design principles
- Data minimization and purpose limitation
- Transparent privacy policies
- User control and consent mechanisms
- Regular privacy impact assessments

### For Individuals
- Understanding privacy settings
- Being aware of data collection practices
- Using privacy-enhancing technologies
- Exercising privacy rights
- Staying informed about AI capabilities`
          },
          {
            id: 'lesson9',
            title: 'Module 3 Quiz',
            duration: '10 min',
            type: 'quiz',
            quiz: [
              {
                question: 'What is selection bias in AI?',
                options: [
                  'When users select biased options',
                  'When training data is not representative of the real-world population',
                  'When AI selects certain features over others',
                  'When developers select which algorithms to use'
                ],
                correctAnswer: 1,
                explanation: 'Selection bias occurs when the training data used to develop an AI system is not representative of the population it will be applied to.'
              },
              {
                question: 'What is differential privacy?',
                options: [
                  'Different privacy policies for different users',
                  'Adding noise to data to protect individual privacy',
                  'Treating different data types with different privacy levels',
                  'Varying privacy settings based on user preferences'
                ],
                correctAnswer: 1,
                explanation: 'Differential privacy is a technique that adds carefully calibrated noise to data to protect individual privacy while still enabling useful statistical analysis.'
              },
              {
                question: 'Which is NOT a principle of GDPR?',
                options: [
                  'Right to explanation',
                  'Right to erasure',
                  'Right to unlimited data collection',
                  'Data minimization'
                ],
                correctAnswer: 2,
                explanation: 'GDPR emphasizes data minimization and user rights. There is no "right to unlimited data collection" - in fact, GDPR restricts data collection.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning Fundamentals',
    description: 'Learn the core concepts of machine learning, including supervised and unsupervised learning, model evaluation, and practical implementation techniques.',
    instructor: 'Prof. Michael Rodriguez',
    duration: '10 weeks',
    level: 'Intermediate',
    category: 'Machine Learning',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    enrolled: 12891,
    rating: 4.9,
    learningObjectives: [
      'Master supervised and unsupervised learning algorithms',
      'Understand model evaluation and validation techniques',
      'Implement ML algorithms from scratch and using libraries',
      'Apply feature engineering and data preprocessing'
    ],
    prerequisites: ['Python programming', 'Basic statistics', 'Linear algebra basics'],
    modules: [
      {
        id: 'ml-mod1',
        title: 'Introduction to Machine Learning',
        lessons: [
          {
            id: 'ml-lesson1',
            title: 'What is Machine Learning?',
            duration: '20 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU',
            content: `# What is Machine Learning?

Machine Learning is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed.

## Core Concept

Instead of writing explicit rules, we:
1. Provide data (examples)
2. Let algorithms find patterns
3. Use those patterns to make predictions

## Types of Learning

### Supervised Learning
- Learn from labeled data
- Examples: classification, regression
- Applications: spam detection, price prediction

### Unsupervised Learning
- Find patterns in unlabeled data
- Examples: clustering, dimensionality reduction
- Applications: customer segmentation, anomaly detection

### Reinforcement Learning
- Learn through trial and error
- Reward-based learning
- Applications: game playing, robotics

## The ML Workflow

1. **Problem Definition**: What are we trying to predict?
2. **Data Collection**: Gathering relevant data
3. **Data Preparation**: Cleaning and preprocessing
4. **Model Selection**: Choosing appropriate algorithms
5. **Training**: Learning from data
6. **Evaluation**: Testing performance
7. **Deployment**: Using in production
8. **Monitoring**: Tracking performance over time`
          },
          {
            id: 'ml-lesson2',
            title: 'Linear Regression',
            duration: '30 min',
            type: 'reading',
            content: `# Linear Regression

Linear regression is one of the most fundamental machine learning algorithms, used to predict continuous values.

## The Basic Idea

Find the best-fitting line through data points:
- **Input**: Features (X)
- **Output**: Continuous value (y)
- **Goal**: Minimize prediction error

## Mathematical Foundation

The linear model:
\`\`\`
y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
\`\`\`

Where:
- y: predicted value
- β₀: intercept (bias)
- β₁...βₙ: coefficients (weights)
- x₁...xₙ: features
- ε: error term

## Cost Function

Mean Squared Error (MSE):
\`\`\`
MSE = (1/n) Σ(yᵢ - ŷᵢ)²
\`\`\`

We minimize this to find optimal parameters.

## Training Methods

### Normal Equation
- Analytical solution
- Computes optimal parameters directly
- Works well for smaller datasets
- Formula: β = (XᵀX)⁻¹Xᵀy

### Gradient Descent
- Iterative optimization
- Updates parameters gradually
- Scalable to large datasets
- Requires learning rate tuning

## Assumptions

Linear regression assumes:
1. **Linearity**: Relationship between X and y is linear
2. **Independence**: Observations are independent
3. **Homoscedasticity**: Constant variance of errors
4. **Normality**: Errors are normally distributed

## Evaluation Metrics

- **R² Score**: Proportion of variance explained
- **MSE**: Average squared error
- **RMSE**: Root mean squared error
- **MAE**: Mean absolute error

## Practical Considerations

### Feature Scaling
Normalize features to similar ranges:
- Standardization: (x - μ) / σ
- Min-Max scaling: (x - min) / (max - min)

### Regularization
Prevent overfitting:
- **Ridge (L2)**: Penalizes large coefficients
- **Lasso (L1)**: Can zero out features
- **Elastic Net**: Combines L1 and L2

## Implementation Example

\`\`\`python
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create and train model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"MSE: {mse:.2f}")
print(f"R²: {r2:.2f}")
\`\`\`

## Common Pitfalls

- **Multicollinearity**: Highly correlated features
- **Outliers**: Can significantly affect the model
- **Non-linear relationships**: Linear models won't capture them
- **Extrapolation**: Predictions outside training range are unreliable`
          },
          {
            id: 'ml-lesson3',
            title: 'Module 1 Quiz',
            duration: '15 min',
            type: 'quiz',
            quiz: [
              {
                question: 'What is the main difference between supervised and unsupervised learning?',
                options: [
                  'Supervised learning is faster',
                  'Supervised learning uses labeled data',
                  'Unsupervised learning is more accurate',
                  'Unsupervised learning requires more data'
                ],
                correctAnswer: 1,
                explanation: 'Supervised learning uses labeled data (input-output pairs) to learn, while unsupervised learning finds patterns in unlabeled data.'
              },
              {
                question: 'What does the cost function in linear regression measure?',
                options: [
                  'The computational cost of training',
                  'The difference between predicted and actual values',
                  'The number of features in the model',
                  'The complexity of the model'
                ],
                correctAnswer: 1,
                explanation: 'The cost function (typically MSE) measures the difference between predicted values and actual values, which we minimize during training.'
              },
              {
                question: 'What is regularization used for?',
                options: [
                  'Making data regular',
                  'Speeding up training',
                  'Preventing overfitting',
                  'Increasing model complexity'
                ],
                correctAnswer: 2,
                explanation: 'Regularization techniques like Ridge and Lasso add penalties to prevent overfitting by constraining model complexity.'
              }
            ]
          }
        ]
      },
      {
        id: 'ml-mod2',
        title: 'Classification Algorithms',
        lessons: [
          {
            id: 'ml-lesson4',
            title: 'Logistic Regression',
            duration: '25 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/yIYKR4sgzI8',
            content: `# Logistic Regression

Despite its name, logistic regression is used for classification, not regression. It predicts the probability of an instance belonging to a particular class.

## Binary Classification

Predicts one of two classes:
- Spam or not spam
- Disease or no disease
- Click or no click

## The Sigmoid Function

Transforms linear output to probability:
\`\`\`
σ(z) = 1 / (1 + e⁻ᶻ)
\`\`\`

Where z = β₀ + β₁x₁ + ... + βₙxₙ

Properties:
- Output range: (0, 1)
- S-shaped curve
- Smooth and differentiable

## Decision Boundary

Classification threshold (typically 0.5):
- If σ(z) ≥ 0.5: Class 1
- If σ(z) < 0.5: Class 0

## Cost Function

Log loss (binary cross-entropy):
\`\`\`
J(β) = -(1/n) Σ[yᵢlog(ŷᵢ) + (1-yᵢ)log(1-ŷᵢ)]
\`\`\`

This is convex, ensuring we can find the global minimum.

## Training

Use gradient descent to minimize cost:
1. Initialize parameters randomly
2. Compute predictions
3. Calculate gradients
4. Update parameters
5. Repeat until convergence

## Multiclass Classification

Extend to multiple classes:

### One-vs-Rest (OvR)
- Train N binary classifiers
- Each predicts one class vs. all others
- Choose class with highest probability

### Softmax Regression
- Direct multiclass extension
- Outputs probability distribution over classes
- Uses softmax function instead of sigmoid

## Evaluation Metrics

### Confusion Matrix
- True Positives (TP)
- True Negatives (TN)
- False Positives (FP)
- False Negatives (FN)

### Derived Metrics
- **Accuracy**: (TP + TN) / Total
- **Precision**: TP / (TP + FP)
- **Recall**: TP / (TP + FN)
- **F1 Score**: 2 × (Precision × Recall) / (Precision + Recall)

### ROC Curve and AUC
- Plot True Positive Rate vs. False Positive Rate
- AUC (Area Under Curve) measures overall performance
- AUC = 1: Perfect classifier
- AUC = 0.5: Random guessing

## Practical Tips

### Class Imbalance
When classes are imbalanced:
- Use stratified sampling
- Adjust class weights
- Use appropriate metrics (F1, AUC)
- Consider resampling techniques

### Feature Engineering
- Polynomial features for non-linear boundaries
- Interaction terms
- Feature scaling is important

### Regularization
- L1 (Lasso): Feature selection
- L2 (Ridge): Prevents overfitting
- Choose based on validation performance`
          },
          {
            id: 'ml-lesson5',
            title: 'Decision Trees and Random Forests',
            duration: '28 min',
            type: 'reading',
            content: `# Decision Trees and Random Forests

Decision trees are intuitive, interpretable models that make decisions through a series of questions about the features.

## Decision Trees

### How They Work

Build a tree structure:
1. Start with all data at root
2. Find best feature to split on
3. Create branches for each outcome
4. Repeat recursively for each branch
5. Stop when reaching stopping criteria

### Splitting Criteria

**For Classification:**
- **Gini Impurity**: Measures probability of incorrect classification
  \`\`\`
  Gini = 1 - Σpᵢ²
  \`\`\`
- **Entropy**: Measures information gain
  \`\`\`
  Entropy = -Σpᵢlog₂(pᵢ)
  \`\`\`

**For Regression:**
- **Mean Squared Error**: Variance reduction

### Stopping Criteria

When to stop growing the tree:
- Maximum depth reached
- Minimum samples per leaf
- Minimum impurity decrease
- All samples in node are same class

### Advantages

- Easy to understand and interpret
- Requires little data preparation
- Handles both numerical and categorical data
- Non-parametric (no assumptions about data distribution)
- Captures non-linear relationships

### Disadvantages

- Prone to overfitting
- Can be unstable (small data changes = different tree)
- Biased toward features with more levels
- Can create overly complex trees

## Random Forests

### Ensemble Learning

Combine multiple models for better performance:
- Reduces overfitting
- More robust predictions
- Better generalization

### How Random Forests Work

1. **Bootstrap Sampling**: Create multiple random subsets of data
2. **Random Feature Selection**: At each split, consider random subset of features
3. **Build Trees**: Train decision tree on each subset
4. **Aggregate**: Combine predictions
   - Classification: Majority vote
   - Regression: Average

### Key Parameters

- **n_estimators**: Number of trees
  - More trees = better performance but slower
  - Typical: 100-500 trees

- **max_depth**: Maximum tree depth
  - Controls overfitting
  - None = unlimited (until other criteria met)

- **max_features**: Features to consider for each split
  - sqrt(n): Good for classification
  - n/3: Good for regression

- **min_samples_split**: Minimum samples to split node
  - Higher = more conservative

- **min_samples_leaf**: Minimum samples in leaf
  - Smooths predictions

### Feature Importance

Random forests provide feature importance scores:
- Based on how much each feature decreases impurity
- Useful for feature selection
- Helps understand model decisions

### Out-of-Bag (OOB) Error

- Each tree uses ~63% of data (bootstrap sample)
- Remaining ~37% used for validation
- OOB error: Average error on out-of-bag samples
- Provides unbiased estimate without separate validation set

### Advantages

- Highly accurate
- Handles large datasets well
- Reduces overfitting compared to single tree
- Provides feature importance
- Robust to outliers and noise
- Parallelizable (trees trained independently)

### Disadvantages

- Less interpretable than single tree
- Slower to train and predict
- Larger model size
- Can overfit on noisy datasets

## Practical Implementation

\`\`\`python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

# Create model
rf = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42
)

# Train
rf.fit(X_train, y_train)

# Evaluate
accuracy = rf.score(X_test, y_test)

# Cross-validation
cv_scores = cross_val_score(rf, X, y, cv=5)
print(f"CV Accuracy: {cv_scores.mean():.3f} (+/- {cv_scores.std():.3f})")

# Feature importance
importances = rf.feature_importances_
for feature, importance in zip(feature_names, importances):
    print(f"{feature}: {importance:.3f}")
\`\`\`

## Hyperparameter Tuning

Use grid search or random search:

\`\`\`python
from sklearn.model_selection import RandomizedSearchCV

param_dist = {
    'n_estimators': [100, 200, 500],
    'max_depth': [10, 20, 30, None],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4]
}

search = RandomizedSearchCV(
    RandomForestClassifier(),
    param_dist,
    n_iter=20,
    cv=5,
    random_state=42
)

search.fit(X_train, y_train)
print(f"Best parameters: {search.best_params_}")
\`\`\``
          },
          {
            id: 'ml-lesson6',
            title: 'Module 2 Quiz',
            duration: '15 min',
            type: 'quiz',
            quiz: [
              {
                question: 'What function does logistic regression use to output probabilities?',
                options: ['Linear function', 'Sigmoid function', 'ReLU function', 'Softmax function'],
                correctAnswer: 1,
                explanation: 'Logistic regression uses the sigmoid function to transform linear outputs into probabilities between 0 and 1.'
              },
              {
                question: 'What is the main advantage of Random Forests over single Decision Trees?',
                options: [
                  'Faster training',
                  'Easier to interpret',
                  'Reduces overfitting',
                  'Uses less memory'
                ],
                correctAnswer: 2,
                explanation: 'Random Forests reduce overfitting by combining multiple decision trees trained on different subsets of data and features.'
              },
              {
                question: 'What does the F1 score measure?',
                options: [
                  'Only precision',
                  'Only recall',
                  'Harmonic mean of precision and recall',
                  'Arithmetic mean of precision and recall'
                ],
                correctAnswer: 2,
                explanation: 'The F1 score is the harmonic mean of precision and recall, providing a single metric that balances both measures.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning Specialization',
    description: 'Master neural networks and deep learning architectures. Learn to build and train deep learning models for various applications.',
    instructor: 'Dr. Emily Zhang',
    duration: '12 weeks',
    level: 'Advanced',
    category: 'Deep Learning',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    enrolled: 9876,
    rating: 4.9,
    learningObjectives: [
      'Understand neural network architectures and training',
      'Implement CNNs for computer vision tasks',
      'Build RNNs and LSTMs for sequence modeling',
      'Apply transfer learning and fine-tuning techniques'
    ],
    prerequisites: ['Machine Learning Fundamentals', 'Python proficiency', 'Calculus and linear algebra'],
    modules: [
      {
        id: 'dl-mod1',
        title: 'Neural Networks Basics',
        lessons: [
          {
            id: 'dl-lesson1',
            title: 'Introduction to Neural Networks',
            duration: '22 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
            content: `# Introduction to Neural Networks

Neural networks are the foundation of deep learning, inspired by the structure of biological neurons in the brain.

## The Perceptron

The simplest neural network unit:
- Takes multiple inputs
- Applies weights to each input
- Sums weighted inputs
- Applies activation function
- Produces output

## Multi-Layer Networks

### Architecture Layers

1. **Input Layer**: Receives raw data
2. **Hidden Layers**: Process and transform data
3. **Output Layer**: Produces final prediction

### Forward Propagation

Data flows forward through the network:
\`\`\`
z = Wx + b
a = activation(z)
\`\`\`

Where:
- W: weight matrix
- x: input vector
- b: bias vector
- z: pre-activation
- a: activation output

## Activation Functions

### Sigmoid
\`\`\`
σ(x) = 1 / (1 + e⁻ˣ)
\`\`\`
- Output: (0, 1)
- Use: Binary classification output layer

### Tanh
\`\`\`
tanh(x) = (eˣ - e⁻ˣ) / (eˣ + e⁻ˣ)
\`\`\`
- Output: (-1, 1)
- Use: Hidden layers (better than sigmoid)

### ReLU (Rectified Linear Unit)
\`\`\`
ReLU(x) = max(0, x)
\`\`\`
- Output: [0, ∞)
- Use: Most common for hidden layers
- Advantages: Fast, avoids vanishing gradient

### Leaky ReLU
\`\`\`
LeakyReLU(x) = max(0.01x, x)
\`\`\`
- Addresses "dying ReLU" problem
- Allows small negative values

### Softmax
\`\`\`
softmax(xᵢ) = eˣⁱ / Σeˣʲ
\`\`\`
- Output: Probability distribution
- Use: Multi-class classification output

## Why Deep Networks?

### Hierarchical Feature Learning

- **Layer 1**: Simple features (edges, colors)
- **Layer 2**: Combinations (shapes, textures)
- **Layer 3**: Parts (eyes, wheels)
- **Layer 4**: Objects (faces, cars)

### Universal Approximation

Neural networks can approximate any continuous function given:
- Sufficient neurons
- Appropriate architecture
- Enough training data

## Network Capacity

### Depth vs. Width

**Deep Networks** (many layers):
- Learn hierarchical representations
- More parameter efficient
- Better generalization

**Wide Networks** (many neurons per layer):
- More parameters
- Can memorize training data
- Risk of overfitting

### Overfitting and Underfitting

**Underfitting**:
- Model too simple
- High training and test error
- Solution: Increase capacity

**Overfitting**:
- Model too complex
- Low training error, high test error
- Solution: Regularization, more data`
          },
          {
            id: 'dl-lesson2',
            title: 'Backpropagation and Training',
            duration: '30 min',
            type: 'reading',
            content: `# Backpropagation and Training

Backpropagation is the algorithm that enables neural networks to learn by computing gradients efficiently.

## The Learning Process

1. **Forward Pass**: Compute predictions
2. **Compute Loss**: Measure error
3. **Backward Pass**: Compute gradients
4. **Update Weights**: Adjust parameters

## Loss Functions

### For Regression

**Mean Squared Error (MSE)**:
\`\`\`
L = (1/n) Σ(yᵢ - ŷᵢ)²
\`\`\`

**Mean Absolute Error (MAE)**:
\`\`\`
L = (1/n) Σ|yᵢ - ŷᵢ|
\`\`\`

### For Classification

**Binary Cross-Entropy**:
\`\`\`
L = -(1/n) Σ[yᵢlog(ŷᵢ) + (1-yᵢ)log(1-ŷᵢ)]
\`\`\`

**Categorical Cross-Entropy**:
\`\`\`
L = -(1/n) Σ Σ yᵢⱼlog(ŷᵢⱼ)
\`\`\`

## Gradient Descent

### Batch Gradient Descent
- Uses entire dataset
- Slow but stable
- Guaranteed convergence to local minimum

### Stochastic Gradient Descent (SGD)
- Uses one sample at a time
- Fast but noisy
- Can escape local minima

### Mini-Batch Gradient Descent
- Uses small batches (32, 64, 128, 256)
- Balance between speed and stability
- Most commonly used in practice

## Optimization Algorithms

### Momentum
Accelerates gradient descent:
\`\`\`
v = βv + (1-β)∇L
θ = θ - αv
\`\`\`
- Smooths updates
- Faster convergence
- Typical β: 0.9

### RMSprop
Adapts learning rate per parameter:
\`\`\`
s = βs + (1-β)(∇L)²
θ = θ - α∇L/√(s + ε)
\`\`\`
- Handles different scales
- Good for non-stationary problems

### Adam (Adaptive Moment Estimation)
Combines momentum and RMSprop:
\`\`\`
m = β₁m + (1-β₁)∇L
v = β₂v + (1-β₂)(∇L)²
θ = θ - α·m̂/√(v̂ + ε)
\`\`\`
- Most popular optimizer
- Works well with default parameters
- Typical: β₁=0.9, β₂=0.999

## Learning Rate

### Fixed Learning Rate
- Simple but requires tuning
- Too high: Divergence
- Too low: Slow convergence

### Learning Rate Schedules

**Step Decay**:
- Reduce by factor every N epochs
- Example: α = α₀ × 0.1^(epoch/10)

**Exponential Decay**:
- Smooth continuous reduction
- α = α₀ × e^(-kt)

**Cosine Annealing**:
- Cyclical learning rate
- Can help escape local minima

### Learning Rate Warmup
- Start with small learning rate
- Gradually increase to target
- Stabilizes early training

## Regularization Techniques

### L1 and L2 Regularization

**L2 (Weight Decay)**:
\`\`\`
L_total = L_data + λΣw²
\`\`\`
- Penalizes large weights
- Most common

**L1**:
\`\`\`
L_total = L_data + λΣ|w|
\`\`\`
- Encourages sparsity
- Feature selection

### Dropout
- Randomly drop neurons during training
- Prevents co-adaptation
- Typical rate: 0.2-0.5
- Only applied during training

### Early Stopping
- Monitor validation loss
- Stop when it stops improving
- Prevents overfitting
- Simple and effective

### Batch Normalization
- Normalizes layer inputs
- Reduces internal covariate shift
- Allows higher learning rates
- Acts as regularizer

## Weight Initialization

### Random Initialization
- Small random values
- Breaks symmetry
- Important for learning

### Xavier/Glorot Initialization
For sigmoid/tanh:
\`\`\`
W ~ Uniform(-√(6/(n_in + n_out)), √(6/(n_in + n_out)))
\`\`\`

### He Initialization
For ReLU:
\`\`\`
W ~ Normal(0, √(2/n_in))
\`\`\`

## Training Best Practices

1. **Data Preparation**
   - Normalize inputs
   - Shuffle training data
   - Split into train/val/test

2. **Architecture Design**
   - Start simple
   - Add complexity gradually
   - Use proven architectures

3. **Hyperparameter Tuning**
   - Learning rate most important
   - Use validation set
   - Try random search

4. **Monitoring**
   - Track training and validation loss
   - Watch for overfitting
   - Use tensorboard or similar tools

5. **Debugging**
   - Check gradients (not NaN/Inf)
   - Verify loss decreases
   - Visualize predictions`
          },
          {
            id: 'dl-lesson3',
            title: 'Module 1 Quiz',
            duration: '15 min',
            type: 'quiz',
            quiz: [
              {
                question: 'Which activation function is most commonly used in hidden layers of modern neural networks?',
                options: ['Sigmoid', 'Tanh', 'ReLU', 'Linear'],
                correctAnswer: 2,
                explanation: 'ReLU (Rectified Linear Unit) is the most common activation function for hidden layers due to its simplicity, computational efficiency, and ability to avoid vanishing gradients.'
              },
              {
                question: 'What is the purpose of backpropagation?',
                options: [
                  'To make predictions',
                  'To compute gradients for weight updates',
                  'To normalize inputs',
                  'To prevent overfitting'
                ],
                correctAnswer: 1,
                explanation: 'Backpropagation is the algorithm used to efficiently compute gradients of the loss function with respect to all weights in the network, enabling learning through gradient descent.'
              },
              {
                question: 'Which optimizer combines momentum and adaptive learning rates?',
                options: ['SGD', 'RMSprop', 'Adam', 'Adagrad'],
                correctAnswer: 2,
                explanation: 'Adam (Adaptive Moment Estimation) combines the benefits of momentum and RMSprop, making it one of the most popular optimizers for training neural networks.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'nlp',
    title: 'Natural Language Processing',
    description: 'Explore the world of NLP and learn to build systems that understand and generate human language using modern transformer architectures.',
    instructor: 'Dr. James Wilson',
    duration: '10 weeks',
    level: 'Advanced',
    category: 'NLP',
    thumbnail: 'https://images.unsplash.com/photo-1516110833967-0b5716ca1387?w=800&q=80',
    enrolled: 8543,
    rating: 4.7,
    learningObjectives: [
      'Master text preprocessing and feature extraction',
      'Understand transformer architecture and attention mechanisms',
      'Build text classification and generation models',
      'Apply pre-trained models like BERT and GPT'
    ],
    prerequisites: ['Deep Learning Specialization', 'Python programming', 'Understanding of neural networks'],
    modules: [
      {
        id: 'nlp-mod1',
        title: 'NLP Fundamentals',
        lessons: [
          {
            id: 'nlp-lesson1',
            title: 'Introduction to NLP',
            duration: '18 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/fOvTtapxa9c',
            content: `# Introduction to Natural Language Processing

NLP enables computers to understand, interpret, and generate human language in valuable ways.

## What is NLP?

Natural Language Processing combines:
- **Linguistics**: Understanding language structure
- **Computer Science**: Algorithms and data structures
- **Machine Learning**: Learning from data
- **AI**: Intelligent behavior

## Common NLP Tasks

### Text Classification
- Sentiment analysis
- Spam detection
- Topic categorization
- Intent recognition

### Named Entity Recognition (NER)
- Identify persons, organizations, locations
- Extract dates, quantities, monetary values
- Custom entity types

### Machine Translation
- Translate between languages
- Preserve meaning and context
- Handle idioms and cultural nuances

### Question Answering
- Extract answers from text
- Generate answers from knowledge
- Conversational QA systems

### Text Generation
- Content creation
- Summarization
- Dialogue systems
- Creative writing

## Challenges in NLP

### Ambiguity
- **Lexical**: Words with multiple meanings
- **Syntactic**: Multiple parse trees
- **Semantic**: Multiple interpretations

### Context Dependence
- Meaning changes with context
- Requires world knowledge
- Cultural and temporal factors

### Variability
- Different ways to express same meaning
- Slang, dialects, and informal language
- Typos and grammatical errors

### Implicit Information
- Sarcasm and irony
- Implied meanings
- Common sense reasoning`
          },
          {
            id: 'nlp-lesson2',
            title: 'Text Preprocessing',
            duration: '25 min',
            type: 'reading',
            content: `# Text Preprocessing

Preparing text data is crucial for NLP tasks. Proper preprocessing can significantly impact model performance.

## Basic Preprocessing Steps

### 1. Lowercasing
Convert all text to lowercase:
\`\`\`python
text = text.lower()
\`\`\`
- Reduces vocabulary size
- "Apple" and "apple" treated the same
- May lose information (proper nouns)

### 2. Tokenization
Split text into words or subwords:
\`\`\`python
tokens = text.split()  # Simple
# or use NLTK
from nltk.tokenize import word_tokenize
tokens = word_tokenize(text)
\`\`\`

Types:
- **Word tokenization**: Split by words
- **Sentence tokenization**: Split by sentences
- **Subword tokenization**: BPE, WordPiece

### 3. Removing Punctuation
\`\`\`python
import string
text = text.translate(str.maketrans('', '', string.punctuation))
\`\`\`
- Simplifies text
- May remove useful information (!, ?)

### 4. Removing Stop Words
Common words with little meaning:
\`\`\`python
from nltk.corpus import stopwords
stop_words = set(stopwords.words('english'))
tokens = [w for w in tokens if w not in stop_words]
\`\`\`

Examples: "the", "is", "at", "which", "on"

### 5. Stemming
Reduce words to root form:
\`\`\`python
from nltk.stem import PorterStemmer
stemmer = PorterStemmer()
stemmed = [stemmer.stem(w) for w in tokens]
\`\`\`

Example: "running" → "run", "better" → "better"

### 6. Lemmatization
Reduce to dictionary form:
\`\`\`python
from nltk.stem import WordNetLemmatizer
lemmatizer = WordNetLemmatizer()
lemmatized = [lemmatizer.lemmatize(w) for w in tokens]
\`\`\`

Example: "running" → "run", "better" → "good"

## Advanced Preprocessing

### Handling Numbers
- Remove completely
- Replace with placeholder
- Keep as-is
- Convert to words

### Handling URLs and Emails
\`\`\`python
import re
text = re.sub(r'http\S+', '', text)  # Remove URLs
text = re.sub(r'\S+@\S+', '', text)  # Remove emails
\`\`\`

### Handling Emojis
- Remove
- Convert to text description
- Keep for sentiment analysis

### Spell Correction
\`\`\`python
from textblob import TextBlob
corrected = str(TextBlob(text).correct())
\`\`\`

## Text Normalization

### Expanding Contractions
"don't" → "do not"
"I'm" → "I am"

### Handling Abbreviations
"USA" → "United States of America"
"Dr." → "Doctor"

## Feature Extraction

### Bag of Words (BoW)
\`\`\`python
from sklearn.feature_extraction.text import CountVectorizer
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(documents)
\`\`\`

Pros:
- Simple and interpretable
- Works well for many tasks

Cons:
- Loses word order
- Ignores semantics
- High dimensionality

### TF-IDF
Term Frequency-Inverse Document Frequency:
\`\`\`python
from sklearn.feature_extraction.text import TfidfVectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(documents)
\`\`\`

Formula:
\`\`\`
TF-IDF(t,d) = TF(t,d) × IDF(t)
IDF(t) = log(N / df(t))
\`\`\`

Where:
- TF: Term frequency in document
- IDF: Inverse document frequency
- N: Total documents
- df: Documents containing term

### N-grams
Sequences of N consecutive words:
\`\`\`python
vectorizer = CountVectorizer(ngram_range=(1, 2))
X = vectorizer.fit_transform(documents)
\`\`\`

- Unigrams: Single words
- Bigrams: Two-word sequences
- Trigrams: Three-word sequences

## Modern Approaches

### Word Embeddings
Dense vector representations:
- Word2Vec
- GloVe
- FastText

### Contextual Embeddings
Context-dependent representations:
- ELMo
- BERT
- GPT

### Subword Tokenization
Handle unknown words:
- Byte-Pair Encoding (BPE)
- WordPiece
- SentencePiece

## Best Practices

1. **Understand Your Task**
   - Classification may need different preprocessing than generation
   - Consider domain-specific requirements

2. **Preserve Important Information**
   - Don't remove everything
   - Punctuation can indicate sentiment
   - Capitalization may be meaningful

3. **Experiment**
   - Try different combinations
   - Validate on held-out data
   - What works for one task may not work for another

4. **Document Your Pipeline**
   - Keep track of preprocessing steps
   - Ensure reproducibility
   - Apply same steps to new data`
          },
          {
            id: 'nlp-lesson3',
            title: 'Module 1 Quiz',
            duration: '12 min',
            type: 'quiz',
            quiz: [
              {
                question: 'What is the difference between stemming and lemmatization?',
                options: [
                  'They are the same thing',
                  'Stemming uses dictionary forms, lemmatization uses root forms',
                  'Lemmatization uses dictionary forms, stemming uses root forms',
                  'Stemming is faster but less accurate'
                ],
                correctAnswer: 2,
                explanation: 'Lemmatization reduces words to their dictionary form (lemma) using vocabulary and morphological analysis, while stemming simply chops off word endings to get the root form.'
              },
              {
                question: 'What does TF-IDF measure?',
                options: [
                  'Only term frequency',
                  'Only document frequency',
                  'Importance of a term in a document relative to a corpus',
                  'The length of a document'
                ],
                correctAnswer: 2,
                explanation: 'TF-IDF measures the importance of a term in a document relative to its frequency across all documents in the corpus, giving higher weight to terms that are frequent in a document but rare overall.'
              },
              {
                question: 'What are stop words?',
                options: [
                  'Words that stop the processing',
                  'Common words with little semantic meaning',
                  'Words at the end of sentences',
                  'Misspelled words'
                ],
                correctAnswer: 1,
                explanation: 'Stop words are common words (like "the", "is", "at") that appear frequently but carry little semantic meaning, often removed during preprocessing to reduce noise.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision with Deep Learning',
    description: 'Learn to build computer vision systems using CNNs and modern architectures. Master image classification, object detection, and segmentation.',
    instructor: 'Prof. Lisa Anderson',
    duration: '10 weeks',
    level: 'Advanced',
    category: 'Computer Vision',
    thumbnail: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80',
    enrolled: 7654,
    rating: 4.8,
    learningObjectives: [
      'Understand CNN architectures and components',
      'Build image classification models',
      'Implement object detection systems',
      'Apply image segmentation techniques'
    ],
    prerequisites: ['Deep Learning Specialization', 'Python and PyTorch/TensorFlow', 'Linear algebra'],
    modules: [
      {
        id: 'cv-mod1',
        title: 'Convolutional Neural Networks',
        lessons: [
          {
            id: 'cv-lesson1',
            title: 'Introduction to CNNs',
            duration: '20 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/YRhxdVk_sIs',
            content: `# Convolutional Neural Networks

CNNs are specialized neural networks designed for processing grid-like data, particularly images.

## Why CNNs for Images?

### Problems with Fully Connected Networks

For a 224×224 RGB image:
- Input size: 224 × 224 × 3 = 150,528 pixels
- First hidden layer (1000 neurons): 150M parameters
- Computationally expensive
- Prone to overfitting
- Ignores spatial structure

### CNN Advantages

- **Parameter Sharing**: Same filter across image
- **Sparse Connectivity**: Each neuron connects to local region
- **Translation Invariance**: Detects features anywhere
- **Hierarchical Learning**: Simple to complex features

## Core Components

### 1. Convolutional Layer

Applies filters to extract features:
\`\`\`
Output = Input ⊗ Filter + Bias
\`\`\`

**Filter (Kernel)**:
- Small matrix (e.g., 3×3, 5×5)
- Slides across input
- Computes dot product
- Produces feature map

**Parameters**:
- **Filter size**: 3×3 most common
- **Stride**: Step size (usually 1 or 2)
- **Padding**: Border handling
  - Valid: No padding
  - Same: Output size = Input size

**Output Size**:
\`\`\`
Output = (Input - Filter + 2×Padding) / Stride + 1
\`\`\`

### 2. Activation Function

Apply non-linearity (usually ReLU):
\`\`\`
ReLU(x) = max(0, x)
\`\`\`

### 3. Pooling Layer

Reduces spatial dimensions:

**Max Pooling**:
- Takes maximum value in window
- Most common (2×2 with stride 2)
- Provides translation invariance
- Reduces computation

**Average Pooling**:
- Takes average value
- Smoother downsampling
- Used in some architectures

### 4. Fully Connected Layer

Traditional neural network layer:
- Flattens spatial dimensions
- Usually at end of network
- Produces final predictions

## Feature Hierarchy

### Layer 1 (Early)
- Edges and gradients
- Simple patterns
- Low-level features

### Layer 2-3 (Middle)
- Textures and shapes
- Combinations of edges
- Mid-level features

### Layer 4+ (Deep)
- Object parts
- Complex patterns
- High-level features

### Final Layers
- Whole objects
- Scene understanding
- Task-specific features

## Classic CNN Architectures

### LeNet-5 (1998)
- First successful CNN
- Handwritten digit recognition
- 7 layers

### AlexNet (2012)
- ImageNet breakthrough
- 8 layers
- ReLU activation
- Dropout regularization
- GPU training

### VGGNet (2014)
- Very deep (16-19 layers)
- Small 3×3 filters
- Simple architecture
- 138M parameters

### ResNet (2015)
- Very deep (50-152 layers)
- Skip connections
- Solves vanishing gradient
- Enables training deeper networks

### Inception/GoogLeNet (2014)
- Inception modules
- Multiple filter sizes
- Efficient computation
- 22 layers

## Design Principles

### Depth
- Deeper networks learn better representations
- Diminishing returns after certain depth
- Requires techniques like skip connections

### Width
- More filters per layer
- Increases capacity
- Computational cost

### Filter Size
- 3×3 most common
- Stack multiple small filters
- More efficient than large filters

### Pooling Strategy
- Reduces spatial dimensions
- Provides invariance
- Some modern architectures avoid pooling`
          },
          {
            id: 'cv-lesson2',
            title: 'Training CNNs',
            duration: '28 min',
            type: 'reading',
            content: `# Training Convolutional Neural Networks

Training CNNs effectively requires understanding data augmentation, transfer learning, and best practices.

## Data Augmentation

Artificially expand training data:

### Geometric Transformations

**Horizontal Flip**:
\`\`\`python
transforms.RandomHorizontalFlip(p=0.5)
\`\`\`
- Mirror image left-right
- Doubles effective dataset size
- Natural for most objects

**Rotation**:
\`\`\`python
transforms.RandomRotation(degrees=15)
\`\`\`
- Rotate by random angle
- Helps with orientation invariance
- Use moderate angles

**Scaling and Cropping**:
\`\`\`python
transforms.RandomResizedCrop(224, scale=(0.8, 1.0))
\`\`\`
- Random crop and resize
- Simulates different distances
- Forces focus on object parts

**Translation**:
\`\`\`python
transforms.RandomAffine(degrees=0, translate=(0.1, 0.1))
\`\`\`
- Shift image position
- Helps with position invariance

### Color Transformations

**Brightness**:
\`\`\`python
transforms.ColorJitter(brightness=0.2)
\`\`\`

**Contrast**:
\`\`\`python
transforms.ColorJitter(contrast=0.2)
\`\`\`

**Saturation**:
\`\`\`python
transforms.ColorJitter(saturation=0.2)
\`\`\`

**Hue**:
\`\`\`python
transforms.ColorJitter(hue=0.1)
\`\`\`

### Advanced Augmentation

**Cutout**:
- Randomly mask square regions
- Forces network to use multiple cues

**Mixup**:
- Blend two images and labels
- Improves generalization

**CutMix**:
- Paste region from one image to another
- Combines benefits of Cutout and Mixup

## Transfer Learning

Leverage pre-trained models:

### Why Transfer Learning?

- **Less Data**: Works with small datasets
- **Faster Training**: Start from good initialization
- **Better Performance**: Learned features transfer
- **Reduced Computation**: Don't train from scratch

### Pre-trained Models

Available in PyTorch/TensorFlow:
- ResNet (18, 34, 50, 101, 152)
- VGG (16, 19)
- Inception v3
- MobileNet
- EfficientNet

### Strategies

**Feature Extraction**:
\`\`\`python
# Freeze all layers
for param in model.parameters():
    param.requires_grad = False

# Replace final layer
model.fc = nn.Linear(512, num_classes)
\`\`\`
- Freeze pre-trained layers
- Train only new classifier
- Fast and effective for similar domains

**Fine-tuning**:
\`\`\`python
# Unfreeze some layers
for param in model.layer4.parameters():
    param.requires_grad = True
\`\`\`
- Train some pre-trained layers
- Use lower learning rate
- Better for different domains

**Full Training**:
- Train entire network
- Use pre-trained weights as initialization
- Requires more data and time

### Learning Rate Strategy

**Differential Learning Rates**:
\`\`\`python
optimizer = optim.Adam([
    {'params': model.layer4.parameters(), 'lr': 1e-4},
    {'params': model.fc.parameters(), 'lr': 1e-3}
])
\`\`\`
- Lower LR for pre-trained layers
- Higher LR for new layers

## Training Best Practices

### Batch Normalization

Normalizes layer inputs:
\`\`\`python
nn.BatchNorm2d(num_features)
\`\`\`

Benefits:
- Faster training
- Higher learning rates
- Reduces internal covariate shift
- Acts as regularizer

### Learning Rate Scheduling

**Step Decay**:
\`\`\`python
scheduler = optim.lr_scheduler.StepLR(
    optimizer, step_size=30, gamma=0.1
)
\`\`\`

**Cosine Annealing**:
\`\`\`python
scheduler = optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=100
)
\`\`\`

**ReduceLROnPlateau**:
\`\`\`python
scheduler = optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', patience=5
)
\`\`\`

### Regularization

**Dropout**:
\`\`\`python
nn.Dropout(p=0.5)
\`\`\`
- Apply before fully connected layers
- Typical: 0.5 for FC, 0.2 for conv

**Weight Decay**:
\`\`\`python
optimizer = optim.Adam(model.parameters(), weight_decay=1e-4)
\`\`\`
- L2 regularization
- Prevents large weights

### Gradient Clipping

Prevents exploding gradients:
\`\`\`python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
\`\`\`

## Monitoring Training

### Metrics to Track

- Training loss
- Validation loss
- Training accuracy
- Validation accuracy
- Learning rate

### Visualization

Use TensorBoard or Weights & Biases:
\`\`\`python
from torch.utils.tensorboard import SummaryWriter
writer = SummaryWriter()
writer.add_scalar('Loss/train', loss, epoch)
\`\`\`

### Early Stopping

Stop when validation loss stops improving:
\`\`\`python
if val_loss < best_val_loss:
    best_val_loss = val_loss
    patience_counter = 0
    save_checkpoint()
else:
    patience_counter += 1
    if patience_counter >= patience:
        break
\`\`\`

## Common Issues

### Overfitting
- Validation loss increases while training loss decreases
- Solutions: More data, augmentation, regularization

### Underfitting
- Both losses high
- Solutions: Bigger model, train longer, reduce regularization

### Vanishing Gradients
- Loss not decreasing
- Solutions: Better initialization, batch norm, skip connections

### Class Imbalance
- Poor performance on minority classes
- Solutions: Weighted loss, oversampling, focal loss`
          },
          {
            id: 'cv-lesson3',
            title: 'Module 1 Quiz',
            duration: '12 min',
            type: 'quiz',
            quiz: [
              {
                question: 'What is the main advantage of CNNs over fully connected networks for images?',
                options: [
                  'They are always faster',
                  'They use parameter sharing and sparse connectivity',
                  'They require less data',
                  'They are easier to implement'
                ],
                correctAnswer: 1,
                explanation: 'CNNs use parameter sharing (same filter across the image) and sparse connectivity (each neuron connects only to a local region), making them much more efficient and effective for image processing.'
              },
              {
                question: 'What is transfer learning?',
                options: [
                  'Transferring data between computers',
                  'Using a pre-trained model as a starting point',
                  'Converting between model formats',
                  'Moving models to production'
                ],
                correctAnswer: 1,
                explanation: 'Transfer learning involves using a model pre-trained on a large dataset (like ImageNet) as a starting point for a new task, leveraging the learned features to improve performance with less data and training time.'
              },
              {
                question: 'What is the purpose of data augmentation?',
                options: [
                  'To make the dataset larger in storage',
                  'To clean the data',
                  'To artificially expand the training set with transformations',
                  'To compress the images'
                ],
                correctAnswer: 2,
                explanation: 'Data augmentation artificially expands the training dataset by applying transformations (flips, rotations, crops, etc.) to existing images, helping the model generalize better and reducing overfitting.'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'ai-ethics',
    title: 'AI Ethics and Responsible AI',
    description: 'Explore the ethical implications of AI systems and learn to build responsible, fair, and transparent AI applications.',
    instructor: 'Dr. Maria Santos',
    duration: '6 weeks',
    level: 'Intermediate',
    category: 'Ethics',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    enrolled: 6789,
    rating: 4.6,
    learningObjectives: [
      'Understand ethical challenges in AI development',
      'Learn fairness metrics and bias mitigation techniques',
      'Apply explainability and interpretability methods',
      'Implement responsible AI practices'
    ],
    prerequisites: ['Introduction to AI', 'Basic understanding of machine learning'],
    modules: [
      {
        id: 'ethics-mod1',
        title: 'Foundations of AI Ethics',
        lessons: [
          {
            id: 'ethics-lesson1',
            title: 'Why AI Ethics Matters',
            duration: '16 min',
            type: 'video',
            videoUrl: 'https://www.youtube.com/embed/AaU6tI2pb3M',
            content: `# Why AI Ethics Matters

As AI systems become more powerful and pervasive, ethical considerations are crucial for responsible development and deployment.

## The Stakes

### Real-World Impact

AI systems affect:
- **Employment**: Automation and job displacement
- **Justice**: Criminal sentencing and policing
- **Healthcare**: Diagnosis and treatment decisions
- **Finance**: Credit and insurance decisions
- **Education**: Admissions and grading
- **Privacy**: Surveillance and data collection

### High-Profile Cases

**COMPAS Recidivism Algorithm**:
- Used in criminal justice
- Found to have racial bias
- Higher false positive rate for Black defendants

**Amazon Hiring Tool**:
- Trained on historical data
- Discriminated against women
- Scrapped after discovery

**Facial Recognition**:
- Higher error rates for minorities
- Used in surveillance without consent
- Raises privacy concerns

## Ethical Principles

### Fairness and Non-Discrimination

AI systems should:
- Treat individuals and groups equitably
- Not discriminate based on protected attributes
- Provide equal opportunity and access
- Account for historical inequities

### Transparency and Explainability

Systems should be:
- Understandable to stakeholders
- Auditable and verifiable
- Clear about capabilities and limitations
- Open about data and methods used

### Privacy and Data Protection

Respect for:
- Individual privacy rights
- Data minimization principles
- Informed consent
- Secure data handling

### Accountability

Clear responsibility for:
- System design and deployment
- Monitoring and maintenance
- Addressing harms
- Redress mechanisms

### Safety and Security

Systems must:
- Be robust and reliable
- Fail safely
- Resist adversarial attacks
- Protect against misuse

### Human Agency and Oversight

Maintain:
- Human control over critical decisions
- Ability to override AI recommendations
- Human-in-the-loop for high-stakes decisions
- Respect for human autonomy

## Stakeholder Perspectives

### Developers
- Technical implementation
- Design choices
- Testing and validation

### Organizations
- Deployment decisions
- Risk management
- Compliance

### Users
- Understanding system behavior
- Trust and acceptance
- Control over personal data

### Affected Individuals
- Impact of decisions
- Fairness and equity
- Recourse options

### Society
- Broader social impact
- Regulatory frameworks
- Public good`
          },
          {
            id: 'ethics-lesson2',
            title: 'Fairness in AI',
            duration: '24 min',
            type: 'reading',
            content: `# Fairness in AI Systems

Fairness is a complex, multifaceted concept with different mathematical definitions and practical implications.

## Types of Fairness

### Individual Fairness

"Similar individuals should be treated similarly"

**Challenges**:
- Defining similarity
- Measuring similarity across features
- Balancing different attributes

**Example**:
Two loan applicants with similar financial profiles should receive similar decisions.

### Group Fairness

"Outcomes should be equitable across demographic groups"

**Variants**:

**Demographic Parity**:
- Equal positive prediction rates across groups
- P(Ŷ=1 | A=0) = P(Ŷ=1 | A=1)
- Where A is protected attribute

**Equal Opportunity**:
- Equal true positive rates across groups
- P(Ŷ=1 | Y=1, A=0) = P(Ŷ=1 | Y=1, A=1)
- Focus on qualified individuals

**Equalized Odds**:
- Equal TPR and FPR across groups
- Both true positives and false positives balanced

**Predictive Parity**:
- Equal precision across groups
- P(Y=1 | Ŷ=1, A=0) = P(Y=1 | Ŷ=1, A=1)

### Impossibility Theorems

**Key Insight**: Different fairness definitions can conflict!

- Cannot satisfy all fairness criteria simultaneously
- Trade-offs are necessary
- Context determines appropriate definition

## Sources of Bias

### Historical Bias

Data reflects past discrimination:
- Hiring data from biased practices
- Criminal justice data from biased policing
- Medical data from unequal access

**Mitigation**:
- Acknowledge historical context
- Adjust for known biases
- Use fairness-aware algorithms

### Representation Bias

Training data not representative:
- Underrepresented groups
- Sampling bias
- Selection bias

**Mitigation**:
- Collect diverse data
- Stratified sampling
- Reweighting techniques

### Measurement Bias

Features measured differently across groups:
- Different data quality
- Proxy variables
- Measurement error

**Mitigation**:
- Standardize measurement
- Validate across groups
- Use multiple indicators

### Aggregation Bias

One model for all groups:
- Different relationships in subgroups
- Loss of nuance
- Inappropriate generalization

**Mitigation**:
- Group-specific models
- Interaction terms
- Hierarchical models

### Evaluation Bias

Biased benchmarks and metrics:
- Test data not representative
- Metrics favor certain groups
- Evaluation criteria biased

**Mitigation**:
- Diverse test sets
- Multiple metrics
- Disaggregated evaluation

## Fairness Metrics

### Classification Metrics

**Confusion Matrix by Group**:
\`\`\`
              Predicted
              0       1
Actual  0    TN      FP
        1    FN      TP
\`\`\`

**Disparate Impact**:
\`\`\`
DI = P(Ŷ=1 | A=0) / P(Ŷ=1 | A=1)
\`\`\`
- Should be close to 1
- 80% rule: DI ≥ 0.8

**Statistical Parity Difference**:
\`\`\`
SPD = P(Ŷ=1 | A=0) - P(Ŷ=1 | A=1)
\`\`\`
- Should be close to 0

**Equal Opportunity Difference**:
\`\`\`
EOD = TPR(A=0) - TPR(A=1)
\`\`\`

### Regression Metrics

**Mean Prediction Difference**:
Average prediction difference between groups

**RMSE Ratio**:
Ratio of RMSE across groups

## Bias Mitigation Strategies

### Pre-processing

Modify training data:

**Reweighting**:
\`\`\`python
from aif360.algorithms.preprocessing import Reweighing
rw = Reweighing(unprivileged_groups, privileged_groups)
dataset_transformed = rw.fit_transform(dataset)
\`\`\`

**Sampling**:
- Oversample minority class
- Undersample majority class
- SMOTE (Synthetic Minority Over-sampling)

**Data Augmentation**:
- Generate synthetic examples
- Balance representation

### In-processing

Modify learning algorithm:

**Fairness Constraints**:
Add fairness as optimization constraint:
\`\`\`
minimize: Loss(θ)
subject to: Fairness_Metric(θ) ≤ ε
\`\`\`

**Adversarial Debiasing**:
Train model to predict target while adversary tries to predict protected attribute

**Prejudice Remover**:
Add regularization term penalizing discrimination

### Post-processing

Modify predictions:

**Threshold Optimization**:
- Different thresholds per group
- Satisfy fairness constraint
- Calibration

**Reject Option Classification**:
- Identify uncertain predictions
- Flip predictions near boundary
- Favor disadvantaged group

## Practical Implementation

\`\`\`python
from aif360.datasets import BinaryLabelDataset
from aif360.metrics import BinaryLabelDatasetMetric
from aif360.algorithms.preprocessing import Reweighing

# Load data
dataset = BinaryLabelDataset(...)

# Check fairness
metric = BinaryLabelDatasetMetric(
    dataset,
    unprivileged_groups=[{'race': 0}],
    privileged_groups=[{'race': 1}]
)

print(f"Disparate Impact: {metric.disparate_impact()}")
print(f"Statistical Parity: {metric.statistical_parity_difference()}")

# Apply mitigation
rw = Reweighing(
    unprivileged_groups=[{'race': 0}],
    privileged_groups=[{'race': 1}]
)
dataset_transformed = rw.fit_transform(dataset)

# Train model
model.fit(dataset_transformed)

# Evaluate fairness
predictions = model.predict(test_data)
metric_after = ClassificationMetric(
    test_data, predictions,
    unprivileged_groups=[{'race': 0}],
    privileged_groups=[{'race': 1}]
)

print(f"Equal Opportunity Difference: {metric_after.equal_opportunity_difference()}")
\`\`\`

## Challenges and Considerations

### Trade-offs

- Accuracy vs. Fairness
- Different fairness definitions
- Individual vs. Group fairness

### Context Matters

- Domain-specific considerations
- Stakeholder values
- Legal requirements

### Ongoing Process

- Monitor deployed systems
- Update as data changes
- Engage stakeholders
- Iterate and improve`
          },
          {
            id: 'ethics-lesson3',
            title: 'Module 1 Quiz',
            duration: '10 min',
            type: 'quiz',
            quiz: [
              {
                question: 'What is demographic parity?',
                options: [
                  'Equal accuracy across all demographics',
                  'Equal positive prediction rates across demographic groups',
                  'Equal representation in training data',
                  'Equal error rates across groups'
                ],
                correctAnswer: 1,
                explanation: 'Demographic parity requires that the probability of a positive prediction is equal across different demographic groups, regardless of the true outcome.'
              },
              {
                question: 'Why can different fairness definitions conflict?',
                options: [
                  'They measure different aspects of fairness',
                  'They use different mathematical formulas',
                  'Impossibility theorems show they cannot all be satisfied simultaneously',
                  'They require different data'
                ],
                correctAnswer: 2,
                explanation: 'Mathematical impossibility theorems prove that different fairness definitions (like demographic parity and equalized odds) cannot all be satisfied simultaneously except in trivial cases, requiring trade-offs.'
              },
              {
                question: 'What is adversarial debiasing?',
                options: [
                  'Removing adversarial examples from data',
                  'Training a model while an adversary tries to predict protected attributes',
                  'Defending against adversarial attacks',
                  'Using adversarial networks for data generation'
                ],
                correctAnswer: 1,
                explanation: 'Adversarial debiasing trains a model to make accurate predictions while simultaneously training an adversary to predict protected attributes from the model\'s predictions, encouraging the model to be fair.'
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper function to get course by ID
export function getCourseById(id: string): Course | undefined {
  return courses.find(course => course.id === id);
}

// Helper function to get lesson by IDs
export function getLessonById(courseId: string, lessonId: string): Lesson | undefined {
  const course = getCourseById(courseId);
  if (!course) return undefined;
  
  for (const module of course.modules) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

// Helper function to get all lessons for a course
export function getAllLessons(courseId: string): Lesson[] {
  const course = getCourseById(courseId);
  if (!course) return [];
  
  return course.modules.flatMap(module => module.lessons);
}

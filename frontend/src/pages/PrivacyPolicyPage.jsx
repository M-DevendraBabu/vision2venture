import { Link } from 'react-router-dom';
import '../styles/Legal.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: August 18, 2026</p>
        </div>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <p>When you use Vision2Venture, we collect the following types of information:</p>
            <h3>a) Account Information</h3>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Password (stored in hashed/encrypted form)</li>
              <li>Google account information (if using Google Sign-In)</li>
            </ul>
            <h3>b) Startup & Business Data</h3>
            <ul>
              <li>Startup names, descriptions, and categories you submit for analysis.</li>
              <li>Business model details, target markets, and technology stacks.</li>
              <li>AI-generated analysis results and reports associated with your account.</li>
            </ul>
            <h3>c) Usage Data</h3>
            <ul>
              <li>Login timestamps and session information.</li>
              <li>Pages visited and features used within the platform.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, operate, and maintain the Vision2Venture platform.</li>
              <li>Generate AI-powered startup analysis and reports.</li>
              <li>Authenticate your identity and manage your account.</li>
              <li>Send password reset emails when requested.</li>
              <li>Improve the accuracy and quality of our AI models and analysis.</li>
              <li>Communicate important service updates or changes.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Third-Party AI Services</h2>
            <p>
              To generate startup analyses and chatbot responses, your submitted data may be processed 
              by the following third-party AI services:
            </p>
            <ul>
              <li><strong>NVIDIA AI</strong> — For primary AI analysis and chatbot responses.</li>
              <li><strong>Groq</strong> — As a fallback AI processing service.</li>
            </ul>
            <p>
              These services process your data in accordance with their own privacy policies. We 
              recommend reviewing their privacy practices. We only send the minimum data necessary 
              to generate your analysis.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Data Storage & Security</h2>
            <p>
              Your data is stored in a cloud-hosted MySQL database with the following security measures:
            </p>
            <ul>
              <li>Passwords are hashed using industry-standard bcrypt encryption.</li>
              <li>Database connections use SSL/TLS encryption.</li>
              <li>Authentication tokens are time-limited and securely generated.</li>
              <li>API keys and sensitive credentials are stored as environment variables, never in source code.</li>
            </ul>
            <p>
              While we implement reasonable security measures, no method of electronic transmission 
              or storage is 100% secure. We cannot guarantee absolute security of your data.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Data Sharing</h2>
            <p>We do <strong>not</strong> sell, rent, or trade your personal information to third parties. We may share data only in the following circumstances:</p>
            <ul>
              <li>With third-party AI services as described in Section 3, solely for analysis processing.</li>
              <li>If required by law, regulation, or legal process.</li>
              <li>To protect the rights, safety, or property of Vision2Venture or its users.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Cookies & Local Storage</h2>
            <p>
              Vision2Venture uses browser local storage to maintain your authentication session (JWT token). 
              We do not use tracking cookies or third-party analytics trackers.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> your personal data stored on our platform.</li>
              <li><strong>Update</strong> your account information through the Profile page.</li>
              <li><strong>Delete</strong> your account and all associated data by contacting us.</li>
              <li><strong>Export</strong> your analysis reports as PDF documents.</li>
              <li><strong>Withdraw</strong> your consent and stop using the Service at any time.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Data Retention</h2>
            <p>
              We retain your account and analysis data for as long as your account is active. If you 
              request account deletion, we will remove your personal data within 30 days, except where 
              retention is required by law.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Children's Privacy</h2>
            <p>
              Vision2Venture is not intended for use by individuals under the age of 16. We do not 
              knowingly collect personal information from children. If you believe a child has provided 
              us with personal data, please contact us immediately.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page 
              with an updated revision date. Your continued use of the platform after changes constitutes 
              acceptance of the updated policy.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or your data, contact us at:
            </p>
            <p className="contact-email">
              📧 <a href="mailto:devendrababumotupalli@gmail.com">devendrababumotupalli@gmail.com</a>
            </p>
          </section>
        </div>

        <div className="legal-footer-nav">
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

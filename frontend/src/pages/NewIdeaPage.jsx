import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { startupAPI, analysisAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FaLaptopCode, FaStore, FaSync, FaChartLine, FaCheckCircle, FaRocket, FaMapMarkerAlt, FaGlobe, FaCogs, FaBullhorn, FaHandshake, FaClipboardList } from 'react-icons/fa';
import '../styles/NewIdea.css';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'FinTech', 'EdTech', 'E-Commerce',
  'SaaS', 'AI/ML', 'Gaming', 'Social Media', 'Food & Beverage',
  'Retail', 'Travel', 'Real Estate', 'Logistics', 'Agriculture',
  'Beauty & Wellness', 'Fitness', 'Fashion', 'Automotive', 'Entertainment',
  'Media', 'Construction', 'Consulting', 'Manufacturing', 'Other'
];

const PRICING_MODELS = {
  online: ['Subscription (Monthly/Annual)', 'Freemium', 'Pay-per-use', 'Ad-supported', 'Commission/Marketplace Fee', 'One-time License', 'Usage-based (API calls)', 'Tiered Plans'],
  offline: ['Per Item/Unit', 'Hourly/Daily Rate', 'Menu-based Pricing', 'Contract/Project-based', 'Membership/Loyalty', 'Walk-in/Fixed Price', 'Franchise Fee', 'Rental/Lease'],
  hybrid: ['Subscription + Walk-in', 'Online Orders + Dine-in', 'Freemium + Premium Physical', 'Commission + Storefront', 'Delivery Fee + In-store']
};

const STAGES = ['Just an Idea', 'Research Phase', 'Prototype/MVP', 'Early Revenue', 'Growing', 'Scaling'];

const TARGET_AUDIENCES = [
  'Students (18-25)', 'Young Professionals (25-35)', 'Working Adults (35-50)',
  'Families', 'Senior Citizens (50+)', 'Small Businesses (SMBs)',
  'Enterprise/Corporate', 'Freelancers/Creators', 'Developers/Technical',
  'General Public (All Ages)'
];

const NewIdeaPage = () => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Step 1 — Core Idea
    title: '',
    description: '',
    industry: '',
    // Step 2 — Sector + Context
    sector: '',
    business_type: '',
    country: '',
    target_audience: '',
    unique_value: '',
    // Online-specific
    target_platform: '',
    monetization_detail: '',
    known_competitors: '',
    // Offline-specific
    specific_location: '',
    store_type: '',
    operating_hours: '',
    premises_size: '',
    supply_needs: '',
    // Hybrid-specific
    online_component: '',
    offline_component: '',
    // Step 3 — Team
    team_size: '1',
    team_skills: '',
    business_stage: '',
    // Step 4 — Financials
    budget: '',
    pricing_model: '',
    revenue_goal: '',
    funding_required: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSectorSelect = (sector) => {
    setFormData({ ...formData, sector, pricing_model: '', business_type: sector });
  };

  const nextStep = () => {
    if (step === 1 && (!formData.title || !formData.description || !formData.industry)) {
      return toast.error('Please fill all required fields');
    }
    if (step === 2 && (!formData.sector || !formData.country)) {
      return toast.error('Please select a sector and location');
    }
    if (step === 3 && (!formData.team_skills || !formData.business_stage)) {
      return toast.error('Please fill team details');
    }
    setStep(s => Math.min(s + 1, 5));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // Auto-generate target_customers description from context
  const buildTargetCustomers = () => {
    const parts = [];
    if (formData.target_audience) parts.push(formData.target_audience);
    if (formData.sector === 'offline' && formData.specific_location) {
      parts.push(`in ${formData.specific_location}`);
    }
    if (formData.sector === 'online' && formData.target_platform) {
      parts.push(`using ${formData.target_platform}`);
    }
    parts.push(`in ${formData.country}`);
    return parts.join(' ') || `${formData.industry} customers in ${formData.country}`;
  };

  // Build enriched description with all sector-specific context
  const buildDescription = () => {
    let desc = formData.description;
    if (formData.unique_value) desc += ` Unique value: ${formData.unique_value}.`;
    if (formData.specific_location) desc += ` Location: ${formData.specific_location}.`;
    if (formData.store_type) desc += ` Type: ${formData.store_type}.`;
    if (formData.operating_hours) desc += ` Hours: ${formData.operating_hours}.`;
    if (formData.premises_size) desc += ` Premises: ${formData.premises_size}.`;
    if (formData.supply_needs) desc += ` Supply chain: ${formData.supply_needs}.`;
    if (formData.target_platform) desc += ` Platform: ${formData.target_platform}.`;
    if (formData.monetization_detail) desc += ` Monetization: ${formData.monetization_detail}.`;
    if (formData.known_competitors) desc += ` Known competitors: ${formData.known_competitors}.`;
    if (formData.online_component) desc += ` Online component: ${formData.online_component}.`;
    if (formData.offline_component) desc += ` Offline component: ${formData.offline_component}.`;
    if (formData.target_audience) desc += ` Target audience: ${formData.target_audience}.`;
    return desc;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: buildDescription(),
        industry: formData.industry,
        country: formData.country,
        business_type: formData.business_type || formData.sector,
        target_customers: buildTargetCustomers(),
        budget: parseFloat(formData.budget) || 0,
        team_skills: formData.team_skills,
        sector: formData.sector,
        pricing_model: formData.pricing_model,
        team_size: parseInt(formData.team_size) || 1,
        business_stage: formData.business_stage,
        revenue_goal: parseFloat(formData.revenue_goal) || 0,
        funding_required: parseFloat(formData.funding_required) || 0
      };

      const res = await startupAPI.create(payload);
      const ideaId = res.data.id;

      toast.info('Idea submitted! Starting AI analysis...');
      await analysisAPI.run(ideaId);
      toast.success('Analysis complete! Redirecting...');
      navigate(`/analysis/${ideaId}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSectorCards = () => (
    <div className="sector-cards-container">
      <div className={`sector-card ${formData.sector === 'online' ? 'active' : ''}`} onClick={() => handleSectorSelect('online')}>
        <div className="sector-icon online"><FaLaptopCode /></div>
        <h3>Online</h3>
        <p>SaaS, Apps, Platforms, E-commerce, Digital Services</p>
      </div>
      <div className={`sector-card ${formData.sector === 'offline' ? 'active' : ''}`} onClick={() => handleSectorSelect('offline')}>
        <div className="sector-icon offline"><FaStore /></div>
        <h3>Offline</h3>
        <p>Restaurants, Shops, Clinics, Studios, Service Centers</p>
      </div>
      <div className={`sector-card ${formData.sector === 'hybrid' ? 'active' : ''}`} onClick={() => handleSectorSelect('hybrid')}>
        <div className="sector-icon hybrid"><FaSync /></div>
        <h3>Hybrid</h3>
        <p>Online + Physical presence, Delivery apps, O2O models</p>
      </div>
    </div>
  );

  // ==================== SECTOR-SPECIFIC QUESTIONS ====================

  const renderOnlineFields = () => (
    <div className="sector-specific-section animate-fade-in">
      <h4 className="sector-specific-title"><FaGlobe /> Online Platform Details</h4>
      <div className="form-row">
        <div className="form-group floating-group">
          <select id="target_platform" name="target_platform" className="floating-input" value={formData.target_platform} onChange={handleChange}>
            <option value="" disabled hidden></option>
            <option value="Web Application">Web Application</option>
            <option value="Mobile App (iOS + Android)">Mobile App (iOS + Android)</option>
            <option value="Both Web & Mobile">Both Web & Mobile</option>
            <option value="Desktop Software">Desktop Software</option>
            <option value="Browser Extension">Browser Extension</option>
            <option value="API / B2B Service">API / B2B Service</option>
            <option value="E-commerce Website">E-commerce Website</option>
          </select>
          <label htmlFor="target_platform" className="floating-label">Target Platform</label>
        </div>
        <div className="form-group floating-group">
          <select id="target_audience" name="target_audience" className="floating-input" value={formData.target_audience} onChange={handleChange}>
            <option value="" disabled hidden></option>
            {TARGET_AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <label htmlFor="target_audience" className="floating-label">Primary Audience</label>
        </div>
      </div>
      <div className="form-group floating-group">
        <input id="unique_value" type="text" name="unique_value" className="floating-input" value={formData.unique_value} onChange={handleChange} placeholder=" " />
        <label htmlFor="unique_value" className="floating-label">What makes you different from competitors?</label>
        <small className="field-hint">e.g. "AI-powered recommendations", "10x faster delivery", "First in this niche"</small>
      </div>
      <div className="form-row">
        <div className="form-group floating-group">
          <input id="monetization_detail" type="text" name="monetization_detail" className="floating-input" value={formData.monetization_detail} onChange={handleChange} placeholder=" " />
          <label htmlFor="monetization_detail" className="floating-label">How will you make money? (Detail)</label>
          <small className="field-hint">e.g. "$9/mo basic, $29/mo pro", "5% commission per order"</small>
        </div>
        <div className="form-group floating-group">
          <input id="known_competitors" type="text" name="known_competitors" className="floating-input" value={formData.known_competitors} onChange={handleChange} placeholder=" " />
          <label htmlFor="known_competitors" className="floating-label">Known Competitors (if any)</label>
          <small className="field-hint">e.g. "Notion, Coda, Airtable"</small>
        </div>
      </div>
    </div>
  );

  const renderOfflineFields = () => (
    <div className="sector-specific-section animate-fade-in">
      <h4 className="sector-specific-title"><FaMapMarkerAlt /> Physical Business Details</h4>
      <div className="form-row">
        <div className="form-group floating-group">
          <input id="specific_location" type="text" name="specific_location" className="floating-input" value={formData.specific_location} onChange={handleChange} placeholder=" " />
          <label htmlFor="specific_location" className="floating-label">Exact Location / Area</label>
          <small className="field-hint">e.g. Kukatpally, Hyderabad — helps find real local competitors</small>
        </div>
        <div className="form-group floating-group">
          <select id="store_type" name="store_type" className="floating-input" value={formData.store_type} onChange={handleChange}>
            <option value="" disabled hidden></option>
            <option value="Restaurant/Cafe">Restaurant / Cafe</option>
            <option value="Retail Shop">Retail Shop</option>
            <option value="Service Center">Service Center (Salon, Clinic, Gym)</option>
            <option value="Franchise">Franchise</option>
            <option value="Street Food/Cart">Street Food / Cart</option>
            <option value="Workshop/Studio">Workshop / Studio</option>
            <option value="Warehouse/Godown">Warehouse / Godown</option>
            <option value="Coaching Center">Coaching Center / Academy</option>
            <option value="Other">Other</option>
          </select>
          <label htmlFor="store_type" className="floating-label">Store / Premises Type</label>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group floating-group">
          <select id="operating_hours" name="operating_hours" className="floating-input" value={formData.operating_hours} onChange={handleChange}>
            <option value="" disabled hidden></option>
            <option value="Morning (6AM-12PM)">Morning Only (6AM-12PM)</option>
            <option value="Afternoon (12PM-6PM)">Afternoon (12PM-6PM)</option>
            <option value="Evening (6PM-12AM)">Evening (6PM-12AM)</option>
            <option value="Full Day (8AM-10PM)">Full Day (8AM-10PM)</option>
            <option value="Split Shift (8AM-1PM, 5PM-11PM)">Split Shift</option>
            <option value="24/7">24/7</option>
            <option value="Weekdays Only">Weekdays Only</option>
            <option value="Weekends Only">Weekends Only</option>
          </select>
          <label htmlFor="operating_hours" className="floating-label">Operating Hours</label>
        </div>
        <div className="form-group floating-group">
          <select id="premises_size" name="premises_size" className="floating-input" value={formData.premises_size} onChange={handleChange}>
            <option value="" disabled hidden></option>
            <option value="Small (under 500 sq ft)">Small (under 500 sq ft)</option>
            <option value="Medium (500-1500 sq ft)">Medium (500-1500 sq ft)</option>
            <option value="Large (1500-5000 sq ft)">Large (1500-5000 sq ft)</option>
            <option value="Very Large (5000+ sq ft)">Very Large (5000+ sq ft)</option>
            <option value="Cart/Stall/Kiosk">Cart / Stall / Kiosk</option>
            <option value="Home-based">Home-based</option>
          </select>
          <label htmlFor="premises_size" className="floating-label">Premises Size</label>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group floating-group">
          <select id="target_audience" name="target_audience" className="floating-input" value={formData.target_audience} onChange={handleChange}>
            <option value="" disabled hidden></option>
            {TARGET_AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <label htmlFor="target_audience" className="floating-label">Primary Audience</label>
        </div>
        <div className="form-group floating-group">
          <input id="supply_needs" type="text" name="supply_needs" className="floating-input" value={formData.supply_needs} onChange={handleChange} placeholder=" " />
          <label htmlFor="supply_needs" className="floating-label">Key Supplies / Inventory Needed</label>
          <small className="field-hint">e.g. "Fresh vegetables, spices, cooking gas" or "Clothing inventory"</small>
        </div>
      </div>
      <div className="form-group floating-group">
        <input id="unique_value" type="text" name="unique_value" className="floating-input" value={formData.unique_value} onChange={handleChange} placeholder=" " />
        <label htmlFor="unique_value" className="floating-label">What makes your business unique?</label>
        <small className="field-hint">e.g. "Secret family recipe", "Only organic salon in the area", "Home delivery under 20 min"</small>
      </div>
    </div>
  );

  const renderHybridFields = () => (
    <div className="sector-specific-section animate-fade-in">
      <h4 className="sector-specific-title"><FaSync /> Hybrid Business Details</h4>
      <div className="form-row">
        <div className="form-group floating-group">
          <input id="specific_location" type="text" name="specific_location" className="floating-input" value={formData.specific_location} onChange={handleChange} placeholder=" " />
          <label htmlFor="specific_location" className="floating-label">Physical Location / Area</label>
          <small className="field-hint">e.g. MG Road, Bangalore</small>
        </div>
        <div className="form-group floating-group">
          <select id="target_platform" name="target_platform" className="floating-input" value={formData.target_platform} onChange={handleChange}>
            <option value="" disabled hidden></option>
            <option value="Web App + Store">Web App + Physical Store</option>
            <option value="Mobile App + Store">Mobile App + Physical Store</option>
            <option value="Delivery App + Kitchen">Delivery App + Cloud Kitchen</option>
            <option value="E-commerce + Showroom">E-commerce + Showroom</option>
            <option value="Online Booking + Offline Service">Online Booking + Offline Service</option>
          </select>
          <label htmlFor="target_platform" className="floating-label">Business Model</label>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group floating-group">
          <input id="online_component" type="text" name="online_component" className="floating-input" value={formData.online_component} onChange={handleChange} placeholder=" " />
          <label htmlFor="online_component" className="floating-label">Describe the Online Part</label>
          <small className="field-hint">e.g. "Website for ordering + delivery tracking app"</small>
        </div>
        <div className="form-group floating-group">
          <input id="offline_component" type="text" name="offline_component" className="floating-input" value={formData.offline_component} onChange={handleChange} placeholder=" " />
          <label htmlFor="offline_component" className="floating-label">Describe the Offline Part</label>
          <small className="field-hint">e.g. "Cloud kitchen with 3 cooking stations"</small>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group floating-group">
          <select id="target_audience" name="target_audience" className="floating-input" value={formData.target_audience} onChange={handleChange}>
            <option value="" disabled hidden></option>
            {TARGET_AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <label htmlFor="target_audience" className="floating-label">Primary Audience</label>
        </div>
        <div className="form-group floating-group">
          <input id="unique_value" type="text" name="unique_value" className="floating-input" value={formData.unique_value} onChange={handleChange} placeholder=" " />
          <label htmlFor="unique_value" className="floating-label">What makes you different?</label>
          <small className="field-hint">e.g. "Only cloud kitchen with live kitchen cam for customers"</small>
        </div>
      </div>
    </div>
  );

  const renderSectorSpecificFields = () => {
    if (formData.sector === 'online') return renderOnlineFields();
    if (formData.sector === 'offline') return renderOfflineFields();
    if (formData.sector === 'hybrid') return renderHybridFields();
    return null;
  };

  // ==================== SECTOR-SPECIFIC FINANCIALS ====================

  const renderSectorFinancials = () => {
    const sectorKey = formData.sector || 'online';
    const budgetLabel = {
      online: 'Development + Marketing Budget',
      offline: 'Total Investment Budget (Setup)',
      hybrid: 'Total Budget (Physical + Digital)'
    }[sectorKey];
    const budgetHint = {
      online: 'Include dev costs, hosting, marketing, tools',
      offline: 'Include rent deposit, interior, equipment, inventory',
      hybrid: 'Include store setup, app dev, marketing'
    }[sectorKey];
    const revenueLabel = {
      online: 'Year 1 Revenue Target',
      offline: 'Expected Monthly Revenue',
      hybrid: 'Year 1 Combined Revenue Goal'
    }[sectorKey];
    const revenueHint = {
      online: 'Annual recurring revenue target',
      offline: 'Estimated daily sales x 30',
      hybrid: 'Online + offline combined'
    }[sectorKey];
    const fundingHint = {
      online: 'Seed/Angel/VC investment needed. 0 if bootstrapped',
      offline: 'Loan, investor capital, etc. 0 if self-funded',
      hybrid: 'External funding needed. 0 if self-funded'
    }[sectorKey];
    const icon = { online: <FaLaptopCode />, offline: <FaStore />, hybrid: <FaSync /> }[sectorKey];

    return (
      <>
        <h4 className="sector-specific-title" style={{marginTop: '1.5rem'}}>{icon} {sectorKey.charAt(0).toUpperCase() + sectorKey.slice(1)} Business Financials</h4>
        <div className="form-row">
          <div className="form-group floating-group">
            <input id="budget" type="number" name="budget" className="floating-input" value={formData.budget} onChange={handleChange} placeholder=" " min="0" required />
            <label htmlFor="budget" className="floating-label">{budgetLabel} *</label>
            <small className="field-hint">{budgetHint}</small>
          </div>
          <div className="form-group floating-group">
            <select id="pricing_model" name="pricing_model" className="floating-input" value={formData.pricing_model} onChange={handleChange} required>
              <option value="" disabled hidden></option>
              {PRICING_MODELS[sectorKey].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label htmlFor="pricing_model" className="floating-label">Pricing Model *</label>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group floating-group">
            <input id="revenue_goal" type="number" name="revenue_goal" className="floating-input" value={formData.revenue_goal} onChange={handleChange} placeholder=" " min="0" required />
            <label htmlFor="revenue_goal" className="floating-label">{revenueLabel} *</label>
            <small className="field-hint">{revenueHint}</small>
          </div>
          <div className="form-group floating-group">
            <input id="funding_required" type="number" name="funding_required" className="floating-input" value={formData.funding_required} onChange={handleChange} placeholder=" " min="0" />
            <label htmlFor="funding_required" className="floating-label">Additional Funding Needed</label>
            <small className="field-hint">{fundingHint}</small>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">

        <div className="wizard-header stagger-1">
          <h1 className="page-title"><FaRocket className="title-icon" /> New Business Plan</h1>
          <p className="page-subtitle">Tell us about your idea and our AI will analyze every angle in under 60 seconds.</p>
        </div>

        <div className="wizard-container glass-card stagger-2">
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill animate-progress-fill" style={{ '--target-width': `${(step / 5) * 100}%` }}></div>
            </div>
            <div className="step-indicators">
              {['Core Idea', 'Business Type', 'Team', 'Financials', 'Review'].map((label, idx) => (
                <div key={idx} className={`step-dot ${step > idx + 1 ? 'completed' : ''} ${step === idx + 1 ? 'active' : ''}`}>
                  <div className="dot-circle">{step > idx + 1 ? <FaCheckCircle /> : idx + 1}</div>
                  <span className="step-label">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>

            {/* STEP 1: Core Idea */}
            {step === 1 && (
              <div className="wizard-step animate-fade-in">
                <h2><FaClipboardList style={{marginRight: 8}} /> What's the big idea?</h2>
                <p className="step-desc">Give us the high-level elevator pitch of your business.</p>

                <div className="form-group floating-group">
                  <input id="title" type="text" name="title" className="floating-input" value={formData.title} onChange={handleChange} placeholder=" " required />
                  <label htmlFor="title" className="floating-label">Business Name / Title *</label>
                  <small className="field-hint">e.g. SmartLearn AI Tutor, Hyderabad Biryani Point, FreshKart Groceries</small>
                </div>

                <div className="form-group floating-group">
                  <textarea id="description" name="description" className="floating-input" rows="4" value={formData.description} onChange={handleChange} placeholder=" " required />
                  <label htmlFor="description" className="floating-label">Describe the Problem & Your Solution *</label>
                  <small className="field-hint">What problem are you solving? Who needs it? How does your solution work? Be as detailed as possible.</small>
                </div>

                <div className="form-group floating-group">
                  <select id="industry" name="industry" className="floating-input" value={formData.industry} onChange={handleChange} required>
                    <option value="" disabled hidden></option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                  <label htmlFor="industry" className="floating-label">Industry / Category *</label>
                </div>
              </div>
            )}

            {/* STEP 2: Business Type + Sector-Specific */}
            {step === 2 && (
              <div className="wizard-step animate-fade-in">
                <h2><FaCogs style={{marginRight: 8}} /> Where will this operate?</h2>
                <p className="step-desc">Select your business type. Different questions will appear based on your choice.</p>

                <div className="form-group">
                  <label className="section-label">Business Type *</label>
                  {renderSectorCards()}
                </div>

                {renderSectorSpecificFields()}

                <div className="form-group floating-group" style={{marginTop: '1rem'}}>
                  <input id="country" type="text" name="country" className="floating-input" value={formData.country} onChange={handleChange} placeholder=" " required />
                  <label htmlFor="country" className="floating-label">{formData.sector === 'offline' ? 'City / Region *' : 'Target Market / Country *'}</label>
                  <small className="field-hint">{formData.sector === 'offline' ? 'e.g. Hyderabad, Mumbai, Delhi' : 'e.g. India, USA, Global'}</small>
                </div>
              </div>
            )}

            {/* STEP 3: Team */}
            {step === 3 && (
              <div className="wizard-step animate-fade-in">
                <h2><FaHandshake style={{marginRight: 8}} /> Who is building this?</h2>
                <p className="step-desc">Tell us about your team and current progress.</p>

                <div className="form-group floating-group">
                  <input id="team_size" type="range" name="team_size" min="1" max="50" className="range-input" value={formData.team_size} onChange={handleChange} />
                  <div className="range-value">Team Size: <span>{formData.team_size} {formData.team_size === '1' ? 'person (Solo Founder)' : 'people'}</span></div>
                </div>

                <div className="form-group floating-group">
                  <input id="team_skills" type="text" name="team_skills" className="floating-input" value={formData.team_skills} onChange={handleChange} placeholder=" " required />
                  <label htmlFor="team_skills" className="floating-label">Key Team Skills *</label>
                  <small className="field-hint">
                    {formData.sector === 'offline'
                      ? 'e.g. Cooking, Management, Customer Service, Accounting, Marketing'
                      : formData.sector === 'hybrid'
                      ? 'e.g. Full-stack Dev, Operations, Marketing, Logistics, Finance'
                      : 'e.g. React, Python, AWS, UI/UX Design, Marketing, Sales'}
                  </small>
                </div>

                <div className="form-group floating-group">
                  <select id="business_stage" name="business_stage" className="floating-input" value={formData.business_stage} onChange={handleChange} required>
                    <option value="" disabled hidden></option>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <label htmlFor="business_stage" className="floating-label">Current Stage *</label>
                </div>
              </div>
            )}

            {/* STEP 4: Financials */}
            {step === 4 && (
              <div className="wizard-step animate-fade-in">
                <h2><FaBullhorn style={{marginRight: 8}} /> Let's talk numbers.</h2>
                <p className="step-desc">
                  {formData.sector === 'offline'
                    ? 'Estimate your setup costs, pricing, and expected revenue.'
                    : formData.sector === 'hybrid'
                    ? 'Budget for both your physical and digital operations.'
                    : 'Outline your development costs, monetization, and targets.'}
                </p>
                {renderSectorFinancials()}
              </div>
            )}

            {/* STEP 5: Review */}
            {step === 5 && (
              <div className="wizard-step animate-fade-in">
                <h2><FaRocket style={{marginRight: 8}} /> Ready for Liftoff</h2>
                <p className="step-desc">Review your business profile. Our AI will analyze market size, competitors, risks, finances, and create a complete roadmap.</p>

                <div className="summary-card glass-card-accent">
                  <div className="summary-header">
                    <h3>{formData.title}</h3>
                    <span className={`sector-badge sector-badge-${formData.sector}`}>{formData.sector}</span>
                  </div>
                  <p className="summary-desc">{formData.description}</p>

                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="summary-label">Industry</span>
                      <span className="summary-value">{formData.industry}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Market</span>
                      <span className="summary-value">{formData.country}</span>
                    </div>
                    {formData.target_audience && (
                      <div className="summary-item">
                        <span className="summary-label">Audience</span>
                        <span className="summary-value">{formData.target_audience}</span>
                      </div>
                    )}
                    {formData.unique_value && (
                      <div className="summary-item">
                        <span className="summary-label">USP</span>
                        <span className="summary-value">{formData.unique_value}</span>
                      </div>
                    )}
                    {formData.specific_location && (
                      <div className="summary-item">
                        <span className="summary-label">Location</span>
                        <span className="summary-value">{formData.specific_location}</span>
                      </div>
                    )}
                    {formData.target_platform && (
                      <div className="summary-item">
                        <span className="summary-label">Platform</span>
                        <span className="summary-value">{formData.target_platform}</span>
                      </div>
                    )}
                    <div className="summary-item">
                      <span className="summary-label">Team</span>
                      <span className="summary-value">{formData.team_size} people ({formData.business_stage})</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Skills</span>
                      <span className="summary-value">{formData.team_skills}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Budget</span>
                      <span className="summary-value">${Number(formData.budget).toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Revenue Goal</span>
                      <span className="summary-value">${Number(formData.revenue_goal).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="explanation-box">
                  Our AI will automatically analyze your target customer base, estimate potential customer volume, evaluate market demand, and identify your ideal customer segments — no need to guess these numbers yourself.
                </div>
              </div>
            )}

            <div className="wizard-actions">
              {step > 1 ? (
                <button type="button" className="btn-secondary" onClick={prevStep}>Back</button>
              ) : <div></div>}

              <button type="submit" className="btn-primary ml-auto" disabled={submitting}>
                {submitting ? (
                  <><FaSync className="fa-spin" /> Analyzing...</>
                ) : step === 5 ? (
                  <><FaChartLine /> Start AI Analysis</>
                ) : (
                  <>Next <span style={{marginLeft: '5px'}}>&#8594;</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewIdeaPage;

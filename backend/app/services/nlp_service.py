import re
import string
import math
from collections import Counter

# Common English stop words
STOP_WORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
    'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
    'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
    'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'through', 'during', 'before', 'after',
    'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
    'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'don', 'should', 'now',
    'also', 'would', 'could', 'may', 'might', 'shall', 'need', 'want', 'like', 'many', 'much',
    'well', 'back', 'even', 'still', 'way', 'take', 'come', 'make', 'get', 'go', 'use', 'using',
    'used', 'new', 'one', 'two', 'first', 'last', 'long', 'great', 'little', 'right', 'big',
    'high', 'different', 'small', 'large', 'next', 'early', 'young', 'important', 'public',
    'bad', 'same', 'able', 'etc', 'based', 'every', 'thing', 'things', 'people', 'really',
    'help', 'know', 'think', 'see', 'look', 'find', 'give', 'tell', 'say', 'try', 'ask',
    'work', 'seem', 'feel', 'leave', 'call', 'keep', 'let', 'begin', 'show', 'hear',
    'play', 'run', 'move', 'live', 'believe', 'bring', 'happen', 'write', 'provide', 'sit',
    'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn', 'change', 'lead',
    'understand', 'watch', 'follow', 'stop', 'create', 'speak', 'read', 'allow', 'add',
    'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember', 'love', 'consider', 'appear',
    'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build', 'stay', 'fall', 'cut', 'reach',
    'kill', 'remain', 'suggest', 'raise', 'pass', 'sell', 'require', 'report', 'decide', 'pull'
}

# Industry-specific keyword boosters for better NLP extraction
DOMAIN_BOOST_WORDS = {
    'technology', 'platform', 'software', 'digital', 'automation', 'cloud', 'saas', 'api',
    'machine', 'learning', 'artificial', 'intelligence', 'blockchain', 'crypto', 'fintech',
    'ecommerce', 'marketplace', 'logistics', 'delivery', 'healthcare', 'telemedicine',
    'edtech', 'education', 'subscription', 'freemium', 'enterprise', 'b2b', 'b2c', 'd2c',
    'analytics', 'dashboard', 'iot', 'sensor', 'renewable', 'solar', 'energy', 'grid',
    'microgrid', 'trading', 'peer', 'community', 'mobile', 'app', 'startup', 'venture',
    'innovation', 'disruption', 'scalable', 'sustainable', 'organic', 'green', 'clean',
    'electric', 'battery', 'storage', 'network', 'wireless', 'security', 'privacy',
    'compliance', 'regulation', 'payment', 'wallet', 'banking', 'insurance', 'invest',
    'funding', 'revenue', 'profit', 'margin', 'growth', 'retention', 'acquisition',
    'conversion', 'engagement', 'optimization', 'personalization', 'recommendation',
    'supply', 'chain', 'inventory', 'warehouse', 'fleet', 'autonomous', 'drone',
    'robot', 'augmented', 'virtual', 'reality', 'gaming', 'streaming', 'content',
    'media', 'social', 'influencer', 'marketing', 'seo', 'brand', 'customer',
    'user', 'experience', 'interface', 'design', 'prototype', 'mvp', 'agile',
    'devops', 'microservices', 'serverless', 'kubernetes', 'docker', 'ci', 'cd',
    'food', 'restaurant', 'biryani', 'cafe', 'kitchen', 'grocery', 'agriculture',
    'farming', 'biotech', 'pharma', 'genomics', 'diagnostics', 'wearable', 'fitness',
    'wellness', 'mental', 'health', 'therapy', 'counseling', 'coaching', 'tutoring',
    'assessment', 'certification', 'training', 'upskilling', 'recruitment', 'talent',
    'hr', 'payroll', 'crm', 'erp', 'project', 'management', 'collaboration',
    'communication', 'video', 'conferencing', 'remote', 'hybrid', 'coworking',
    'real', 'estate', 'property', 'rental', 'mortgage', 'construction', 'smart',
    'home', 'city', 'infrastructure', 'transport', 'mobility', 'ride', 'sharing',
    'travel', 'tourism', 'hotel', 'booking', 'flight', 'adventure', 'outdoor',
    'sports', 'fashion', 'apparel', 'textile', 'beauty', 'cosmetics', 'skincare',
    'luxury', 'premium', 'artisan', 'handmade', 'craft', 'recycling', 'waste',
    'circular', 'economy', 'carbon', 'emission', 'offset', 'climate', 'environment',
    'water', 'purification', 'sanitation', 'hygiene', 'safety', 'monitoring',
    'surveillance', 'cybersecurity', 'encryption', 'authentication', 'identity',
    'verification', 'biometric', 'facial', 'recognition', 'chatbot', 'assistant',
    'natural', 'language', 'processing', 'sentiment', 'analysis', 'prediction',
    'forecasting', 'simulation', 'modeling', 'visualization', 'reporting',
    'installation', 'maintenance', 'repair', 'service', 'consulting', 'advisory'
}


class NLPService:
    @staticmethod
    def extract_keywords(text: str, title: str = "", industry: str = "", sector: str = "") -> list:
        """
        Extract meaningful keywords using enhanced TF-IDF with:
        - Bigram (2-word phrase) extraction for compound terms
        - Domain-specific boosting for industry-relevant words
        - Title word prioritization
        - Deduplication and capitalization
        """
        if not text or not text.strip():
            return []

        # Combine title + description for richer extraction
        full_text = f"{title} {text}" if title else text
        text_lower = full_text.lower()
        text_clean = text_lower.translate(str.maketrans('', '', string.punctuation))
        words = text_clean.split()

        # --- 1. Extract valid single words (unigrams) ---
        valid_words = []
        for word in words:
            word = word.strip()
            if (len(word) > 2 and word not in STOP_WORDS
                and not word.isdigit() and not all(c in string.punctuation for c in word)):
                valid_words.append(word)

        if not valid_words:
            return []

        word_counts = Counter(valid_words)
        total_words = len(valid_words)

        # --- 2. Extract bigrams (2-word phrases) ---
        bigrams = []
        for i in range(len(valid_words) - 1):
            bigram = f"{valid_words[i]} {valid_words[i+1]}"
            bigrams.append(bigram)
        bigram_counts = Counter(bigrams)

        # --- 3. Score unigrams with enhanced TF-IDF + domain boosting ---
        title_words_set = set(title.lower().split()) if title else set()
        industry_lower = industry.lower() if industry else ""

        scored_keywords = []
        for word, count in word_counts.items():
            tf = count / total_words
            idf = math.log10(1 + len(word))

            # Domain boost: words matching known industry/startup vocabulary
            domain_boost = 1.5 if word in DOMAIN_BOOST_WORDS else 1.0

            # Title boost: words appearing in the idea title
            title_boost = 2.0 if word in title_words_set else 1.0

            # Industry match boost
            industry_boost = 1.8 if word in industry_lower else 1.0

            score = tf * idf * domain_boost * title_boost * industry_boost
            # Capitalize for display
            display_word = word.capitalize()
            scored_keywords.append((score, display_word))

        # --- 4. Score bigrams ---
        for bigram, count in bigram_counts.items():
            if count >= 1:
                tf = count / max(len(bigrams), 1)
                idf = math.log10(1 + len(bigram))
                # Bigrams get a natural boost for being more specific
                bigram_boost = 2.0
                # Check if any word in bigram is domain-relevant
                bigram_words = bigram.split()
                domain_match = any(w in DOMAIN_BOOST_WORDS for w in bigram_words)
                domain_boost = 1.5 if domain_match else 1.0

                score = tf * idf * bigram_boost * domain_boost
                display_bigram = " ".join(w.capitalize() for w in bigram_words)
                scored_keywords.append((score, display_bigram))

        # --- 5. Sort by score, deduplicate, and return top 15 ---
        scored_keywords.sort(key=lambda x: x[0], reverse=True)

        seen = set()
        final_keywords = []
        for score, kw in scored_keywords:
            kw_lower = kw.lower()
            if kw_lower not in seen:
                seen.add(kw_lower)
                final_keywords.append(kw)
                if len(final_keywords) >= 15:
                    break

        # --- 6. Add industry and sector as bonus tags if not already present ---
        bonus_tags = []
        if industry and industry.lower() not in seen:
            bonus_tags.append(industry)
        if sector and sector.lower() not in seen and sector.lower() != 'online':
            bonus_tags.append(sector.capitalize())

        final_keywords = final_keywords + bonus_tags

        return final_keywords[:15]

    @staticmethod
    def identify_domain(text: str, industry: str) -> str:
        """Identify business domain from text and industry using rich dictionaries."""
        text_lower = text.lower()
        domain_map = {
            'ecommerce': ['ecommerce', 'e-commerce', 'online store', 'shopping', 'marketplace', 'buy', 'sell', 'cart', 'checkout', 'b2c', 'd2c', 'retail', 'merchant'],
            'saas': ['saas', 'software', 'platform', 'subscription', 'cloud', 'tool', 'dashboard', 'b2b', 'api', 'integration', 'automate', 'workflow'],
            'healthcare': ['health', 'medical', 'hospital', 'patient', 'doctor', 'medicine', 'clinic', 'wellness', 'telehealth', 'care', 'therapy'],
            'fintech': ['finance', 'payment', 'banking', 'money', 'investment', 'wallet', 'loan', 'fintech', 'crypto', 'blockchain', 'trading', 'insurance'],
            'edtech': ['education', 'learning', 'student', 'course', 'teach', 'school', 'tutor', 'edtech', 'university', 'curriculum', 'training'],
            'ai': ['artificial intelligence', 'machine learning', 'ai', 'ml', 'neural', 'deep learning', 'nlp', 'computer vision', 'generative', 'predictive'],
            'food': ['food', 'restaurant', 'biryani', 'cafe', 'kitchen', 'delivery', 'recipe', 'cooking', 'beverage', 'dining', 'catering', 'grocery'],
            'logistics': ['logistics', 'delivery', 'shipping', 'transport', 'supply chain', 'warehouse', 'fleet', 'freight', 'cargo', 'last-mile'],
            'social': ['social', 'community', 'network', 'connect', 'chat', 'messaging', 'forum', 'dating', 'media', 'influencer'],
            'gaming': ['game', 'gaming', 'esports', 'play', 'entertainment', 'vr', 'ar', 'console', 'mobile game', 'multiplayer'],
            'travel': ['travel', 'tourism', 'hotel', 'booking', 'flight', 'trip', 'vacation', 'hospitality', 'airbnb', 'tour'],
            'real_estate': ['real estate', 'property', 'housing', 'rent', 'apartment', 'construction', 'mortgage', 'broker', 'commercial'],
            'cleantech': ['solar', 'wind', 'renewable', 'energy', 'microgrid', 'clean', 'green', 'sustainable', 'carbon', 'emission', 'electric', 'battery'],
            'agritech': ['agriculture', 'farming', 'crop', 'soil', 'irrigation', 'harvest', 'livestock', 'organic', 'fertilizer'],
            'cybersecurity': ['security', 'cyber', 'encryption', 'firewall', 'threat', 'vulnerability', 'authentication', 'privacy', 'data protection']
        }

        # Simple scoring
        scores = Counter()
        for domain, keywords in domain_map.items():
            for kw in keywords:
                if kw in text_lower:
                    scores[domain] += 1

        if scores:
            best_domain = scores.most_common(1)[0][0]
            return best_domain

        return industry.lower() if industry else 'general'

    @staticmethod
    def _split_sentences(text: str) -> list:
        # Improved sentence boundary detection handling Mr., Dr., e.g., i.e.
        text = re.sub(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|\!)\s', '\n', text)
        return [s.strip() for s in text.split('\n') if s.strip()]

    @staticmethod
    def parse_problem_solution(description: str) -> dict:
        """Parse description to extract problem and solution parts."""
        sentences = NLPService._split_sentences(description)

        problem_sentences = []
        solution_sentences = []

        solution_triggers = [
            'solve', 'solution', 'provide', 'offer', 'we will', 'platform will',
            'our app', 'our platform', 'we build', 'we create', 'helps', 'enables',
            'allows', 'designed to', 'aims to', 'built to', 'purpose is',
            'approach', 'method', 'way to', 'through our', 'by using', 'key feature'
        ]

        is_solution_part = False
        for sent in sentences:
            text_lower = sent.lower()
            if any(trigger in text_lower for trigger in solution_triggers):
                is_solution_part = True

            if is_solution_part:
                solution_sentences.append(sent)
            else:
                problem_sentences.append(sent)

        return {
            "problem": " ".join(problem_sentences).strip() if problem_sentences else "Not explicitly stated.",
            "solution": " ".join(solution_sentences).strip() if solution_sentences else "Not explicitly stated."
        }

    @staticmethod
    def summarize(text: str, max_sentences: int = 3) -> str:
        """Simple extractive summarization."""
        sentences = NLPService._split_sentences(text)
        if len(sentences) <= max_sentences:
            return " ".join(sentences)

        # Very basic approach: pick first sentence (context), and 1-2 longest sentences (often contain most detail)
        first_sent = sentences[0]
        remaining = sentences[1:]
        remaining.sort(key=len, reverse=True)

        selected = [first_sent] + remaining[:max_sentences - 1]
        # Keep original order
        final_sents = [s for s in sentences if s in selected]
        return " ".join(final_sents)

    @staticmethod
    def extract_entities(text: str) -> dict:
        """Extract basic entities (business names, locations, monetary values) using regex."""
        entities = {
            "money": [],
            "locations": [],
            "organizations": []
        }

        # Monetary values: $100, $1M, 50 USD, etc.
        money_pattern = r'(\$\d+(?:,\d+)*(?:\.\d+)?(?:[kKmMbB])?|\d+(?:,\d+)*(?:\.\d+)?\s*(?:USD|EUR|GBP))'
        entities["money"] = list(set(re.findall(money_pattern, text)))

        # Organizations (capitalized words like "Google", "Vision2Venture", etc.)
        org_pattern = r'(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Inc\.|LLC|Corp\.|Company|Ltd\.))'
        entities["organizations"] = list(set(re.findall(org_pattern, text)))

        # We can't reliably detect locations with just regex without a gazetteer,
        # but we can look for "in [Capitalized Word]"
        loc_pattern = r'\bin\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b'
        possible_locs = re.findall(loc_pattern, text)
        # Filter out common false positives (In Addition, In Summary, etc.)
        bad_locs = {'Addition', 'Summary', 'Conclusion', 'General', 'Fact', 'Reality'}
        entities["locations"] = list(set([l for l in possible_locs if l not in bad_locs]))

        return entities

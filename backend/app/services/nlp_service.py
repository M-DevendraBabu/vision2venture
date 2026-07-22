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
    'bad', 'same', 'able', 'etc', 'based', 'every', 'thing', 'things', 'people', 'really'
}

class NLPService:
    @staticmethod
    def extract_keywords(text: str) -> list:
        """Extract meaningful keywords using a TF-IDF-like approach."""
        text_lower = text.lower()
        text_clean = text_lower.translate(str.maketrans('', '', string.punctuation))
        words = text_clean.split()

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
        
        # Approximate IDF based on word length and commonality heuristic
        # (Longer words are typically more specific/rare in general language)
        scored_words = []
        for word, count in word_counts.items():
            tf = count / total_words
            # Fake IDF: log(1 + length) as a proxy for specificity
            idf = math.log10(1 + len(word)) 
            score = tf * idf
            scored_words.append((score, word))
            
        scored_words.sort(key=lambda x: x[0], reverse=True)
        return [w[1] for w in scored_words[:15]]

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
            'real_estate': ['real estate', 'property', 'housing', 'rent', 'apartment', 'construction', 'mortgage', 'broker', 'commercial']
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
        # This is a naive regex-based approach. 
        # In a real system, spaCy or similar NER would be used.
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

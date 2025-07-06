"""
Smart Code Reuse System for Developer Workflow
Implements natural language processing to parse user prompts and reuse existing code from default_scripts
"""
import os
import re
import time
import json
from typing import Dict, List, Tuple, Optional
import logging
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PromptParser:
    """Natural Language Processing for developer prompts"""

    def __init__(self):
        # Common programming keywords and patterns
        self.code_keywords = {
            'api': ['api', 'endpoint', 'rest', 'http', 'request', 'response'],
            'database': ['database', 'sql', 'query', 'db', 'table', 'record'],
            'authentication': ['auth', 'login', 'user', 'password', 'token', 'session'],
            'file_ops': ['file', 'read', 'write', 'upload', 'download', 'csv', 'json'],
            'device': ['device', 'mode', 'check', 'status', 'connection', 'hardware'],
            'validation': ['validate', 'check', 'verify', 'test', 'ensure'],
            'data_processing': ['process', 'parse', 'transform', 'convert', 'format'],
            'monitoring': ['monitor', 'log', 'track', 'observe', 'watch'],
            'utility': ['utility', 'helper', 'common', 'shared', 'generic']
        }

        # Function-specific patterns
        self.function_patterns = {
            'crud': ['create', 'read', 'update', 'delete', 'add', 'remove', 'get', 'set'],
            'network': ['connect', 'disconnect', 'ping', 'socket', 'tcp', 'udp'],
            'security': ['encrypt', 'decrypt', 'hash', 'secure', 'protect'],
            'testing': ['test', 'mock', 'verify', 'assert', 'check']
        }

        '''
        def parse_prompt(self, prompt: str) -> Dict[str, List[str]]:
            """Parse user prompt and extract relevant keywords and intents"""
            prompt_lower = prompt.lower()

            # Extract keywords by category
            extracted_keywords = defaultdict(list)
            confidence_scores = {}

            # Check for code category matches
            for category, keywords in self.code_keywords.items():
                matches = []
                for keyword in keywords:
                    if keyword in prompt_lower:
                        matches.append(keyword)

                if matches:
                    extracted_keywords[category] = matches
                    confidence_scores[category] = len(matches) / len(keywords) * 100

            # Check for function patterns
            for pattern, functions in self.function_patterns.items():
                matches = []
                for func in functions:
                    if func in prompt_lower:
                        matches.append(func)

                if matches:
                    extracted_keywords[f"{pattern}_functions"] = matches
                    confidence_scores[f"{pattern}_functions"] = len(matches) / len(functions) * 100

            # Extract potential file/module names
            file_mentions = re.findall(r'\b(\w+)\.py\b', prompt_lower)
            if file_mentions:
                extracted_keywords['mentioned_files'] = file_mentions

            # Extract quoted strings (potential exact matches)
            quoted_strings = re.findall(r'["\']([^"\']+)["\']', prompt)
            if quoted_strings:
                extracted_keywords['quoted_strings'] = quoted_strings

            return {
                'keywords': dict(extracted_keywords),
                'confidence': confidence_scores,
                'prompt_length': len(prompt),
                'word_count': len(prompt.split())
            }
        '''

    def parse_prompt(self, prompt: str) -> Dict[str, List[str]]:
        """Parse user prompt and extract relevant keywords and intents"""
        prompt_lower = prompt.lower()

        # Extract keywords by category
        extracted_keywords = defaultdict(list)
        confidence_scores = {}

        # Check for code category matches
        for category, keywords in self.code_keywords.items():
            matches = []
            for keyword in keywords:
                if keyword in prompt_lower:
                    matches.append(keyword)

            if matches:
                extracted_keywords[category] = matches
                confidence_scores[category] = len(matches) / len(keywords) * 100

        # Check for function patterns
        for pattern, functions in self.function_patterns.items():
            matches = []
            for func in functions:
                if func in prompt_lower:
                    matches.append(func)

            if matches:
                extracted_keywords[f"{pattern}_functions"] = matches
                confidence_scores[f"{pattern}_functions"] = len(matches) / len(functions) * 100

        # ADD THIS NEW SECTION - Extract direct meaningful words from prompt
        import re
        prompt_words = re.findall(r'\b[a-zA-Z]{3,}\b', prompt_lower)  # Words 3+ letters

        # Filter out common stop words but keep technical terms
        stop_words = {
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
            'her', 'was', 'one', 'our', 'out', 'day', 'has', 'him', 'his', 'how',
            'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did',
            'its', 'let', 'put', 'say', 'she', 'too', 'use', 'also', 'code',
            'python', 'generate', 'test', 'unit', 'this', 'that', 'with', 'from'
        }

        meaningful_words = [word for word in prompt_words if word not in stop_words and len(word) > 2]

        if meaningful_words:
            extracted_keywords['direct_words'] = meaningful_words
            confidence_scores['direct_words'] = 100  # Full confidence for direct word extraction

        print(f"[PROMPT_DEBUG] Extracted direct words from '{prompt}': {meaningful_words}")

        # Extract potential file/module names
        file_mentions = re.findall(r'\b(\w+)\.py\b', prompt_lower)
        if file_mentions:
            extracted_keywords['mentioned_files'] = file_mentions

        # Extract quoted strings (potential exact matches)
        quoted_strings = re.findall(r'["\']([^"\']+)["\']', prompt)
        if quoted_strings:
            extracted_keywords['quoted_strings'] = quoted_strings

        return {
            'keywords': dict(extracted_keywords),
            'confidence': confidence_scores,
            'prompt_length': len(prompt),
            'word_count': len(prompt.split())
        }

class DefaultScriptsManager:
    """Manages default scripts and their metadata"""

    def __init__(self, default_scripts_path: str = None):
        if default_scripts_path is None:
            self.default_scripts_path = os.path.join(os.getcwd(), "..", "Backend", "default_scripts")
        else:
            self.default_scripts_path = default_scripts_path

        self.scripts_cache = {}
        self.metadata_cache = {}

    def scan_default_scripts(self) -> Dict[str, Dict]:
        """Scan and index all scripts in default_scripts directory"""
        logger.info(f"Scanning default_scripts directory: {self.default_scripts_path}")

        if not os.path.exists(self.default_scripts_path):
            logger.warning(f"Default scripts directory not found: {self.default_scripts_path}")
            return {}

        scripts_found = {}

        # Get all Python files
        for filename in os.listdir(self.default_scripts_path):
            if filename.endswith('.py') and not filename.endswith('_test.py'):
                script_name = filename[:-3]  # Remove .py extension

                main_file_path = os.path.join(self.default_scripts_path, filename)
                test_file_path = os.path.join(self.default_scripts_path, f"{script_name}_test.py")

                # Read main file
                try:
                    with open(main_file_path, 'r', encoding='utf-8') as f:
                        main_content = f.read()
                except Exception as e:
                    logger.error(f"Error reading {main_file_path}: {e}")
                    continue

                # Read test file if exists
                test_content = ""
                has_tests = False
                if os.path.exists(test_file_path):
                    try:
                        with open(test_file_path, 'r', encoding='utf-8') as f:
                            test_content = f.read()
                        has_tests = True
                    except Exception as e:
                        logger.warning(f"Error reading test file {test_file_path}: {e}")

                # Extract metadata
                metadata = self._extract_script_metadata(main_content)

                # Add script name words to keywords
                script_words = script_name.lower().split('_')
                metadata['keywords'].extend(script_words)
                metadata['keywords'] = list(set(metadata['keywords']))  # Remove duplicates

                scripts_found[script_name] = {
                    'script_name': script_name,
                    'main_content': main_content,
                    'test_content': test_content,
                    'has_tests': has_tests,
                    'metadata': metadata,
                    'file_path': main_file_path,
                    'test_file_path': test_file_path if has_tests else None
                }

                logger.info(f"Indexed: {script_name}.py (tests: {'✅' if has_tests else '❌'})")

        self.scripts_cache = scripts_found
        logger.info(f"Successfully indexed {len(scripts_found)} scripts")
        return scripts_found

    def _extract_script_metadata(self, content: str) -> Dict:
        """Extract metadata from script content"""
        metadata = {
            'functions': [],
            'classes': [],
            'imports': [],
            'keywords': [],
            'docstring': '',
            'functionality': []
        }

        lines = content.split('\n')

        for line in lines:
            line_stripped = line.strip()

            # Extract function definitions
            if line_stripped.startswith('def '):
                func_match = re.match(r'def\s+(\w+)\s*\(', line_stripped)
                if func_match:
                    metadata['functions'].append(func_match.group(1))

            # Extract class definitions
            elif line_stripped.startswith('class '):
                class_match = re.match(r'class\s+(\w+)', line_stripped)
                if class_match:
                    metadata['classes'].append(class_match.group(1))

            # Extract imports
            elif line_stripped.startswith(('import ', 'from ')):
                metadata['imports'].append(line_stripped)

        # Extract module docstring
        docstring_match = re.search(r'"""(.*?)"""', content, re.DOTALL)
        if docstring_match:
            metadata['docstring'] = docstring_match.group(1).strip()

        # IMPROVED: Extract meaningful keywords from script name and function names
        all_keywords = set()

        # Add words from function names (split by underscore)
        for func_name in metadata['functions']:
            words = func_name.lower().split('_')
            all_keywords.update(words)

        # Add words from filename (this should be passed from the calling method)
        # We'll extract this from the script path in scan_default_scripts

        # Add technical keywords from comments and docstrings
        technical_words = set()
        comments = re.findall(r'#\s*(.+)', content)
        for comment in comments:
            # Only keep technical words, not common English words
            words = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', comment.lower())
            for word in words:
                if len(word) > 3 and word not in {'this', 'that', 'with', 'from', 'will', 'have', 'been', 'they',
                                                  'them', 'were', 'said', 'each', 'which', 'their', 'time', 'would',
                                                  'about', 'there', 'could', 'other', 'after', 'first', 'well', 'water',
                                                  'very', 'what', 'know', 'get', 'use', 'man', 'new', 'now', 'old',
                                                  'see', 'him', 'two', 'how', 'its', 'our', 'out', 'day', 'had', 'his',
                                                  'her', 'hot', 'but', 'oil', 'sit', 'set', 'run', 'eat', 'far', 'sea',
                                                  'eye', 'off', 'own', 'under', 'name', 'very', 'through', 'just',
                                                  'form', 'much', 'great', 'think', 'say', 'help', 'low', 'line',
                                                  'turn', 'cause', 'move', 'right', 'boy', 'old', 'too', 'any', 'same',
                                                  'tell', 'does', 'set', 'three', 'want', 'air', 'well', 'also', 'play',
                                                  'small', 'end', 'put', 'home', 'read', 'hand', 'port', 'large',
                                                  'spell', 'add', 'even', 'land', 'here', 'must', 'big', 'high', 'such',
                                                  'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light',
                                                  'kind', 'off', 'need', 'house', 'picture', 'try', 'us', 'again',
                                                  'animal', 'point', 'mother', 'world', 'near', 'build', 'self',
                                                  'earth', 'father', 'head', 'stand', 'own', 'page', 'should',
                                                  'country', 'found', 'answer', 'school', 'grow', 'study', 'still',
                                                  'learn', 'plant', 'cover', 'food', 'sun', 'four', 'between', 'state',
                                                  'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree',
                                                  'cross', 'farm', 'hard', 'start', 'might', 'story', 'saw', 'far',
                                                  'sea', 'draw', 'left', 'late', 'run', 'dont', 'while', 'press',
                                                  'close', 'night', 'real', 'life', 'few', 'north', 'open', 'seem',
                                                  'together', 'next', 'white', 'children', 'begin', 'got', 'walk',
                                                  'example', 'ease', 'paper', 'group', 'always', 'music', 'those',
                                                  'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car',
                                                  'feet', 'care', 'second', 'book', 'carry', 'took', 'science', 'eat',
                                                  'room', 'friend', 'began', 'idea', 'fish', 'mountain', 'stop', 'once',
                                                  'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face',
                                                  'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready',
                                                  'above', 'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird',
                                                  'soon', 'body', 'dog', 'family', 'direct', 'leave', 'song', 'measure',
                                                  'door', 'product', 'black', 'short', 'numeral', 'class', 'wind',
                                                  'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock',
                                                  'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass',
                                                  'since', 'top', 'whole', 'king', 'space', 'heard', 'best', 'hour',
                                                  'better', 'during', 'hundred', 'five', 'remember', 'step', 'early',
                                                  'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb', 'sing',
                                                  'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten',
                                                  'simple', 'several', 'vowel', 'toward', 'war', 'lay', 'against',
                                                  'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve',
                                                  'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold',
                                                  'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly',
                                                  'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait', 'plan',
                                                  'figure', 'star', 'box', 'noun', 'field', 'rest', 'correct', 'able',
                                                  'pound', 'done', 'beauty', 'drive', 'stood', 'contain', 'front',
                                                  'teach', 'week', 'final', 'gave', 'green', 'oh', 'quick', 'develop',
                                                  'ocean', 'warm', 'free', 'minute', 'strong', 'special', 'mind',
                                                  'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch',
                                                  'multiply', 'nothing', 'course', 'stay', 'wheel', 'full', 'force',
                                                  'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island',
                                                  'foot', 'system', 'busy', 'test', 'record', 'boat', 'common', 'gold',
                                                  'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'thousands',
                                                  'ago', 'ran', 'check', 'game', 'shape', 'equate', 'hot', 'miss',
                                                  'brought', 'heat', 'snow', 'tire', 'bring', 'yes', 'distant', 'fill',
                                                  'east', 'paint', 'language', 'among'}:
                    technical_words.add(word)

        all_keywords.update(technical_words)

        # Add words from docstring if it exists
        if metadata['docstring']:
            doc_words = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', metadata['docstring'].lower())
            for word in doc_words:
                if len(word) > 3 and word not in {'this', 'that', 'with', 'from', 'will', 'have', 'been', 'they',
                                                  'them'}:
                    all_keywords.add(word)

        metadata['keywords'] = list(all_keywords)

        # Rest of your existing functionality detection code...
        return metadata


class SmartCodeMatcher:
    """Matches user prompts with existing scripts using NLP"""

    def __init__(self, scripts_manager: DefaultScriptsManager):
        self.scripts_manager = scripts_manager
        self.prompt_parser = PromptParser()

    def find_matching_scripts(self, prompt: str, confidence_threshold: float = 2.0) -> List[Dict]:
        """Find scripts that match the user prompt"""
        # Parse the prompt
        parsed_prompt = self.prompt_parser.parse_prompt(prompt)

        # Get available scripts
        scripts = self.scripts_manager.scripts_cache
        if not scripts:
            scripts = self.scripts_manager.scan_default_scripts()

        matches = []

        for script_name, script_info in scripts.items():
            confidence = self._calculate_confidence(parsed_prompt, script_info)

            if confidence >= confidence_threshold:
                match_info = {
                    'script_name': script_name,
                    'confidence': confidence,
                    'main_content': script_info['main_content'],
                    'test_content': script_info['test_content'],
                    'has_tests': script_info['has_tests'],
                    'metadata': script_info['metadata'],
                    'match_reasons': self._get_match_reasons(parsed_prompt, script_info)
                }
                matches.append(match_info)

        # Sort by confidence (highest first)
        matches.sort(key=lambda x: x['confidence'], reverse=True)

        return matches

    def _calculate_confidence(self, parsed_prompt: Dict, script_info: Dict) -> float:
        """Calculate confidence score between prompt and script"""
        total_score = 0.0
        max_possible_score = 0.0

        script_metadata = script_info['metadata']
        prompt_keywords = parsed_prompt['keywords']
        script_name = script_info['script_name']

        # 1. Direct keyword matches (40% weight)
        keyword_score = 0
        keyword_max = 25

        all_script_keywords = set()
        all_script_keywords.update(script_metadata.get('keywords', []))
        all_script_keywords.update(script_metadata.get('functions', []))
        all_script_keywords.update(script_metadata.get('functionality', []))

        all_prompt_keywords = set()
        for category_keywords in prompt_keywords.values():
            if isinstance(category_keywords, list):
                all_prompt_keywords.update(category_keywords)

        if all_prompt_keywords and all_script_keywords:
            keyword_intersection = all_prompt_keywords.intersection(all_script_keywords)
            keyword_score = len(keyword_intersection) / len(all_prompt_keywords) * keyword_max

        total_score += keyword_score
        max_possible_score += keyword_max

        # 2. Function name matches (30% weight)
        function_score = 0
        function_max = 15

        script_functions = set(func.lower() for func in script_metadata.get('functions', []))
        prompt_function_words = set()

        for category, keywords in prompt_keywords.items():
            if 'function' in category and isinstance(keywords, list):
                prompt_function_words.update(kw.lower() for kw in keywords)

        if prompt_function_words and script_functions:
            function_intersection = prompt_function_words.intersection(script_functions)
            function_score = len(function_intersection) / len(prompt_function_words) * function_max

        total_score += function_score
        max_possible_score += function_max

        # 3. File name similarity (20% weight)
        filename_score = 0
        filename_max = 25

        mentioned_files = prompt_keywords.get('mentioned_files', [])
        if mentioned_files:
            script_name_lower = script_info['script_name'].lower()
            for mentioned_file in mentioned_files:
                if mentioned_file.lower() in script_name_lower or script_name_lower in mentioned_file.lower():
                    filename_score = filename_max
                    break

        total_score += filename_score
        max_possible_score += filename_max

        # 4. Semantic similarity (5% weight)
        semantic_score = 0
        semantic_max = 5

        # Simple semantic matching based on functionality
        script_functionality = script_metadata.get('functionality', [])
        if script_functionality:
            for func in script_functionality:
                if any(func.split('_')[0] in str(prompt_keywords).lower() for func in script_functionality):
                    semantic_score = semantic_max
                    break

        total_score += semantic_score
        max_possible_score += semantic_max

        # 5. ADD THIS NEW BONUS: Script name word matching (30% bonus weight)
        script_name_bonus = 0
        script_name_max = 30

        # Extract direct words from prompt
        prompt_direct_words = set(prompt_keywords.get('direct_words', []))

        # Extract words from script name (split by underscore)
        script_name_words = set(script_name.lower().split('_'))

        if prompt_direct_words and script_name_words:
            name_intersection = prompt_direct_words.intersection(script_name_words)
            if name_intersection:
                script_name_bonus = len(name_intersection) / len(prompt_direct_words) * script_name_max
                print(
                    f"[BONUS_DEBUG] {script_name}: prompt_words={prompt_direct_words}, script_words={script_name_words}, intersection={name_intersection}, bonus={script_name_bonus:.1f}")

        total_score += script_name_bonus
        max_possible_score += script_name_max

        # Calculate final confidence percentage
        confidence = (total_score / max_possible_score * 100) if max_possible_score > 0 else 0

        return round(confidence, 1)

    def _get_match_reasons(self, parsed_prompt: Dict, script_info: Dict) -> List[str]:
        """Get human-readable reasons for the match"""
        reasons = []

        script_metadata = script_info['metadata']
        prompt_keywords = parsed_prompt['keywords']

        # Check for keyword matches
        all_script_keywords = set()
        all_script_keywords.update(script_metadata.get('keywords', []))
        all_script_keywords.update(script_metadata.get('functions', []))

        all_prompt_keywords = set()
        for category_keywords in prompt_keywords.values():
            if isinstance(category_keywords, list):
                all_prompt_keywords.update(category_keywords)

        keyword_matches = all_prompt_keywords.intersection(all_script_keywords)
        if keyword_matches:
            reasons.append(f"Keyword matches: {', '.join(list(keyword_matches)[:3])}")

        # Check for function matches
        script_functions = script_metadata.get('functions', [])
        if script_functions:
            reasons.append(f"Available functions: {', '.join(script_functions[:3])}")

        # Check for functionality matches
        functionality = script_metadata.get('functionality', [])
        if functionality:
            reasons.append(f"Functionality: {', '.join(functionality)}")

        return reasons


class DeveloperWorkflowReuse:
    """Main class for developer workflow smart code reuse"""

    def __init__(self, default_scripts_path: str = None):
        self.scripts_manager = DefaultScriptsManager(default_scripts_path)
        self.matcher = SmartCodeMatcher(self.scripts_manager)

        # Statistics tracking
        self.reuse_statistics = {
            'total_requests': 0,
            'reuse_hits': 0,
            'confidence_scores': [],
            'total_time_saved': 0.0
        }

    def initialize(self) -> bool:
        """Initialize the smart reuse system"""
        logger.info("🚀 Initializing Smart Code Reuse System for Developer Workflow...")

        scripts_found = self.scripts_manager.scan_default_scripts()

        if scripts_found:
            logger.info(f"✅ Successfully loaded {len(scripts_found)} scripts")
            for script_name, script_info in scripts_found.items():
                has_tests = "✅" if script_info['has_tests'] else "❌"
                functions_count = len(script_info['metadata']['functions'])
                logger.info(f"  📄 {script_name}.py | Tests: {has_tests} | Functions: {functions_count}")
            return True
        else:
            logger.warning("⚠️ No scripts found in default_scripts directory")
            return False

    def get_reusable_code(self, prompt: str, include_tests: bool = True, confidence_threshold: float =2.0) -> \
    Optional[Dict]:
        """Main function to get reusable code or return None for LLaMA fallback"""

        self.reuse_statistics['total_requests'] += 1
        start_time = time.time()

        logger.info(f"🔍 Analyzing prompt for reusable code...")
        logger.info(f"Prompt: {prompt[:100]}...")

        # Find matching scripts
        matches = self.matcher.find_matching_scripts(prompt, confidence_threshold)

        if not matches:
            logger.info("❌ No matching scripts found, will use LLaMA generation")
            return None

        # Use the best match
        best_match = matches[0]

        # Track successful reuse
        self.reuse_statistics['reuse_hits'] += 1
        self.reuse_statistics['confidence_scores'].append(best_match['confidence'])

        # Estimate time saved (average LLaMA generation time is ~15-45 seconds for developer code)
        time_saved = 30  # Estimated seconds saved by not using LLaMA
        self.reuse_statistics['total_time_saved'] += time_saved

        logger.info(f"✅ Found reusable code: {best_match['script_name']} ({best_match['confidence']:.1f}% confidence)")
        logger.info(f"⚡ Estimated time saved: {time_saved}s")
        logger.info(f"📋 Match reasons: {'; '.join(best_match['match_reasons'])}")

        # Prepare the response structure (similar to LLaMA generation response)
        reused_code = []

        # Debug: Check if main_content exists
        print(f"[DEBUG] main_content length: {len(best_match.get('main_content', ''))}")
        print(f"[DEBUG] main_content preview: {best_match.get('main_content', '')[:500]}...")

        # Main code file
        main_code_entry = {
            'file_name': f"{best_match['script_name']}.py",
            'story_title': f"Smart Reuse: {best_match['script_name']}",
            'story_id': f"REUSE-{best_match['script_name'].upper()}",
            'generated_code': f"""# ♻️ AI OLLAMA MODEL GENERATED CODE
# Filename: {best_match['script_name']}.py
# ========================================================================

{best_match['main_content']}"""
        }
        reused_code.append(main_code_entry)

        # Unit test file (if requested and available)
        if include_tests and best_match['has_tests']:
            test_code_entry = {
                'file_name': f"{best_match['script_name']}_test.py",
                'story_title': f"Smart Reuse: {best_match['script_name']} Tests",
                'story_id': f"REUSE-TEST-{best_match['script_name'].upper()}",
                'generated_code': f"""# ♻️ AI OLLAMA MODEL GENERATED CODE UNIT TEST CODE
# Filename: Backend/default_scripts/{best_match['script_name']}_test.py
# ========================================================================

{best_match['test_content']}"""
            }
            reused_code.append(test_code_entry)

        processing_time = time.time() - start_time

        # Debug: Check final generated code structure
        print(f"[DEBUG] Generated {len(reused_code)} code entries")
        for i, entry in enumerate(reused_code):
            print(f"[DEBUG] Entry {i + 1}:")
            print(f"  - file_name: {entry.get('file_name')}")
            print(f"  - story_title: {entry.get('story_title')}")
            print(f"  - generated_code length: {len(entry.get('generated_code', ''))}")
            print(f"  - generated_code preview: {entry.get('generated_code', '')[:500]}...")

        return {
            'success': True,
            'generated_code': reused_code,
            'reused_from_cache': True,
            'confidence': best_match['confidence'],
            'source_script': best_match['script_name'],
            'time_saved': time_saved,
            'processing_time': processing_time,
            'match_reasons': best_match['match_reasons'],
            'message': f"♻️ Smart Reuse: Found '{best_match['script_name']}' with {best_match['confidence']:.1f}% confidence (saved ~{time_saved}s)"
        }

    def get_reuse_statistics(self) -> Dict:
        """Get smart reuse statistics"""
        total_scripts = len(self.scripts_manager.scripts_cache)
        reuse_rate = (self.reuse_statistics['reuse_hits'] / max(self.reuse_statistics['total_requests'], 1)) * 100
        avg_confidence = sum(self.reuse_statistics['confidence_scores']) / max(
            len(self.reuse_statistics['confidence_scores']), 1)

        return {
            'total_scripts': total_scripts,
            'reuse_rate': round(reuse_rate, 1),
            'time_saved': round(self.reuse_statistics['total_time_saved'], 1),
            'avg_confidence': round(avg_confidence, 1),
            'total_requests': self.reuse_statistics['total_requests'],
            'reuse_hits': self.reuse_statistics['reuse_hits']
        }


# Example usage and integration
if __name__ == "__main__":
    # Initialize the smart reuse system
    reuse_system = DeveloperWorkflowReuse()

    if reuse_system.initialize():
        # Example prompt
        test_prompt = "I need to check device mode and validate the connection status"

        result = reuse_system.get_reusable_code(
            prompt=test_prompt,
            include_tests=True,
            confidence_threshold=2.0
        )

        if result:
            print("✅ Found reusable code!")
            print(f"Confidence: {result['confidence']:.1f}%")
            print(f"Source: {result['source_script']}")
            print(f"Generated {len(result['generated_code'])} file(s)")
        else:
            print("❌ No suitable reusable code found, use LLaMA generation")

        # Show statistics
        stats = reuse_system.get_reuse_statistics()
        print(f"📊 Reuse Statistics: {stats}")
    else:
        print("❌ Failed to initialize smart reuse system")
# Enhanced Auto_test_gen.py - Supporting Both QA and Developer Workflows
import os
import re
import json
import time
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch


class EnhancedCodeGenerator:
    """Enhanced code generator supporting both QA testing and application development"""

    def __init__(self, mode='qa'):
        self.mode = mode  # 'qa' or 'developer'
        self.initialize_llama_model()

    def initialize_llama_model(self):
        """Initialize LLaMA model for code generation"""
        try:
            print(f"[{self.mode.upper()}] Initializing LLaMA model...")

            # Initialize tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")
            self.model = AutoModelForCausalLM.from_pretrained(
                "meta-llama/Llama-2-7b-chat-hf",
                device_map="auto",
                torch_dtype=torch.float16
            )

            # Create generation pipeline
            self.generator = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
            )

            print(f"[{self.mode.upper()}] LLaMA model initialized successfully")

        except Exception as e:
            print(f"[ERROR] Failed to initialize LLaMA model: {e}")
            # Fallback to simulated generation for development
            self.generator = None

    def generate_code(self, input_data, context=None):
        """Main code generation entry point"""
        if self.mode == 'developer':
            return self.generate_application_code(input_data, context)
        else:
            return self.generate_test_code(input_data)

    def generate_application_code(self, user_story, codebase_context=None):
        """Generate application code from user stories"""
        try:
            print(f"[DEVELOPER] Generating code for story: {user_story.get('title', 'Unknown')}")

            # Build context-aware prompt
            prompt = self.build_developer_prompt(user_story, codebase_context)

            # Generate code using LLaMA
            if self.generator:
                generated_code = self.generate_with_llama(prompt, mode='developer')
            else:
                generated_code = self.generate_fallback_app_code(user_story)

            # Clean and format the generated code
            clean_code = self.extract_and_clean_code(generated_code, mode='developer')

            return {
                'success': True,
                'code': clean_code,
                'story_id': user_story.get('id', 'unknown'),
                'file_name': f"{user_story.get('id', 'story').lower().replace('-', '_')}_implementation.py"
            }

        except Exception as e:
            print(f"[ERROR] Application code generation failed: {e}")
            return {
                'success': False,
                'code': f"# Error generating code: {str(e)}",
                'story_id': user_story.get('id', 'unknown'),
                'error': str(e)
            }

    def build_developer_prompt(self, user_story, context):
        """Build context-aware prompt for application code generation"""
        context_info = ""
        if context:
            libraries = context.get('imports', [])[:10]
            patterns = list(context.get('patterns', {}).keys())

            context_info = f"""
Existing Codebase Context:
- Available Libraries: {', '.join(libraries) if libraries else 'None specified'}
- Common Patterns: {', '.join(patterns) if patterns else 'Standard patterns'}
- Functions Available: {len(context.get('functions', {}))} utility functions
"""

        prompt = f"""<s>[INST] You are an expert Python developer creating production-ready application code.

User Story Requirements:
- Story ID: {user_story.get('id', 'N/A')}
- Title: {user_story.get('title', 'N/A')}
- Description: {user_story.get('description', 'N/A')}
- Acceptance Criteria: {user_story.get('acceptance_criteria', 'N/A')}
- Priority: {user_story.get('priority', 'Medium')}

{context_info}

Instructions:
1. Generate complete, production-ready Python code that implements this user story
2. Use existing libraries from the codebase where appropriate
3. Follow Python best practices and PEP 8 standards
4. Include comprehensive error handling and logging
5. Add detailed docstrings and comments
6. Make the code modular and testable
7. Include input validation and security considerations
8. Provide usage examples in comments

Generate a complete Python implementation that satisfies all acceptance criteria.

```python [/INST]"""

        return prompt

    def generate_test_code(self, test_case_data):
        """Generate test code (existing QA functionality)"""
        try:
            print(f"[QA] Generating test code for: {test_case_data.get('test_case_name', 'Unknown')}")

            # Build test-specific prompt
            prompt = self.build_test_prompt(test_case_data)

            # Generate code using LLaMA
            if self.generator:
                generated_code = self.generate_with_llama(prompt, mode='qa')
            else:
                generated_code = self.generate_fallback_test_code(test_case_data)

            # Clean and format the generated code
            clean_code = self.extract_and_clean_code(generated_code, mode='qa')

            return {
                'success': True,
                'code': clean_code,
                'test_case_name': test_case_data.get('test_case_name', 'unknown')
            }

        except Exception as e:
            print(f"[ERROR] Test code generation failed: {e}")
            return {
                'success': False,
                'code': f"# Error generating test code: {str(e)}",
                'test_case_name': test_case_data.get('test_case_name', 'unknown'),
                'error': str(e)
            }

    def build_test_prompt(self, test_case_data):
        """Build prompt for test code generation (existing QA logic)"""
        test_steps = test_case_data.get('test_steps', '').replace(''', "'").replace(''', "'")
        expected_results = test_case_data.get('expected_results', '').replace(''', "'").replace(''', "'")

        prompt = f"""<s>[INST] You are an expert test automation engineer.

Test Case: {test_case_data.get('test_case_name', 'N/A')}
Purpose: {test_case_data.get('purpose', 'N/A')}
Pre-conditions: {test_case_data.get('pre_conditions', 'N/A')}
Test Steps: {test_steps}
Expected Results: {expected_results}

Write a Python script that:
- Defines a function and uses the if __name__ == "__main__": block to call that function
- Ensures the script uses try and except blocks
- Assumes result is the output of subprocess.run() with capture_output=True and text=True
- Accesses the stdout attribute of the result from subprocess.run() and applies .strip() to remove leading and trailing whitespace
- Uses regex to check whether the output satisfies the expected result described above
- Prints the output of dmcli command and also prints "[PASS]" if the expectation is met; otherwise, prints "[FAIL]"
- Includes clear print statements such as [PASS], [FAIL], or [ERROR] to indicate the result
- Contains a main block so it can be executed independently without relying on any testing framework like pytest

```python [/INST]"""

        return prompt

    def generate_with_llama(self, prompt, mode='qa'):
        """Generate code using LLaMA model"""
        try:
            print(f"[{mode.upper()}] Generating code with LLaMA...")

            # Configure generation parameters based on mode
            if mode == 'developer':
                max_tokens = 800
                temperature = 0.2  # Lower temperature for more deterministic code
                top_p = 0.8
            else:
                max_tokens = 400
                temperature = 0.3
                top_p = 0.9

            outputs = self.generator(
                prompt,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
                eos_token_id=self.tokenizer.eos_token_id,
                repetition_penalty=1.1
            )

            generated_text = outputs[0]['generated_text']
            print(f"[{mode.upper()}] Code generation completed")

            return generated_text

        except Exception as e:
            print(f"[ERROR] LLaMA generation failed: {e}")
            if mode == 'developer':
                return self.generate_fallback_app_code({})
            else:
                return self.generate_fallback_test_code({})

    def extract_and_clean_code(self, generated_text, mode='qa'):
        """Extract and clean generated code"""
        try:
            # Extract code from markdown code blocks
            code_match = re.search(r"```python(.*?)```", generated_text, re.DOTALL)
            if code_match:
                clean_code = code_match.group(1).strip()
            else:
                # Try to extract code after the prompt
                prompt_end = generated_text.find('[/INST]')
                if prompt_end != -1:
                    clean_code = generated_text[prompt_end + 7:].strip()
                else:
                    clean_code = generated_text.strip()

            # Remove any remaining instruction text
            clean_code = self.remove_instruction_text(clean_code)

            # Add appropriate headers based on mode
            if mode == 'developer':
                header = f"""#!/usr/bin/env python3
'''
Generated Application Code
Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}
Mode: Developer Workflow
'''

import logging
import sys
from typing import Any, Dict, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

"""
            else:
                header = f"""#!/usr/bin/env python3
'''
Generated Test Script
Generated on: {time.strftime('%Y-%m-%d %H:%M:%S')}
Mode: QA Testing Workflow
'''

import subprocess
import re
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

"""

            return header + clean_code

        except Exception as e:
            print(f"[ERROR] Code cleaning failed: {e}")
            return f"# Error in code extraction: {str(e)}\n{generated_text}"

    def remove_instruction_text(self, code):
        """Remove common instruction text from generated code"""
        # Remove common LLaMA instruction artifacts
        instruction_patterns = [
            r"Here's.*?implementation.*?:",
            r"I'll.*?create.*?:",
            r"This.*?script.*?will.*?:",
            r"The.*?following.*?code.*?:",
            r"```python.*?\n",
            r"```.*?\n",
            r"Here is.*?:",
            r"Let me.*?:",
            r"I'll.*?help.*?:",
        ]

        cleaned_code = code
        for pattern in instruction_patterns:
            cleaned_code = re.sub(pattern, "", cleaned_code, flags=re.IGNORECASE | re.DOTALL)

        return cleaned_code.strip()

    def generate_fallback_app_code(self, user_story):
        """Generate fallback application code when LLaMA is not available"""
        story_id = user_story.get('id', 'unknown')
        title = user_story.get('title', 'Unknown Feature')
        description = user_story.get('description', 'No description provided')

        fallback_code = f'''
class {story_id.replace('-', '_').title()}Implementation:
    """
    Implementation for User Story: {title}

    Description: {description}

    This is a template implementation generated when LLaMA model is not available.
    Replace this with actual implementation logic.
    """

    def __init__(self):
        self.logger = logging.getLogger(self.__class__.__name__)
        self.logger.info(f"Initializing {{self.__class__.__name__}}")

    def execute(self) -> Dict[str, Any]:
        """
        Main execution method for the user story implementation

        Returns:
            Dict[str, Any]: Result of the operation
        """
        try:
            self.logger.info("Starting implementation execution")

            # TODO: Implement the actual logic for: {title}
            result = {{
                "status": "success",
                "message": "Implementation completed",
                "data": {{}}
            }}

            self.logger.info("Implementation execution completed successfully")
            return result

        except Exception as e:
            self.logger.error(f"Implementation execution failed: {{e}}")
            return {{
                "status": "error",
                "message": str(e),
                "data": {{}}
            }}

    def validate_input(self, input_data: Any) -> bool:
        """
        Validate input data

        Args:
            input_data: The input to validate

        Returns:
            bool: True if valid, False otherwise
        """
        # TODO: Implement input validation logic
        return True

    def process_data(self, data: Any) -> Any:
        """
        Process the data according to business logic

        Args:
            data: The data to process

        Returns:
            Any: Processed data
        """
        # TODO: Implement data processing logic
        return data

def main():
    """Main function to demonstrate the implementation"""
    try:
        implementation = {story_id.replace('-', '_').title()}Implementation()
        result = implementation.execute()

        print(f"Execution result: {{result}}")

        if result["status"] == "success":
            print("[PASS] Implementation executed successfully")
        else:
            print("[FAIL] Implementation execution failed")

    except Exception as e:
        print(f"[ERROR] Main execution failed: {{e}}")
        sys.exit(1)

if __name__ == "__main__":
    main()
'''

        return fallback_code

    def generate_fallback_test_code(self, test_case_data):
        """Generate fallback test code when LLaMA is not available"""
        test_name = test_case_data.get('test_case_name', 'Unknown Test')

        fallback_code = f'''
def test_{test_name.lower().replace(' ', '_')}():
    """
    Test Case: {test_name}

    This is a template test generated when LLaMA model is not available.
    Replace this with actual test implementation logic.
    """
    try:
        logger.info("Starting test execution: {test_name}")

        # TODO: Replace with actual test command
        test_command = ["echo", "Test execution placeholder"]

        # Execute the test command
        result = subprocess.run(
            test_command,
            capture_output=True,
            text=True,
            timeout=30
        )

        # Get the output
        output = result.stdout.strip()
        logger.info(f"Command output: {{output}}")
        print(f"Test output: {{output}}")

        # TODO: Replace with actual validation logic
        if result.returncode == 0:
            print("[PASS] Test completed successfully")
            logger.info("Test passed")
        else:
            print("[FAIL] Test failed")
            logger.error("Test failed")

    except subprocess.TimeoutExpired:
        print("[ERROR] Test timed out")
        logger.error("Test execution timed out")
    except Exception as e:
        print(f"[ERROR] Test execution failed: {{e}}")
        logger.error(f"Test execution error: {{e}}")

def main():
    """Main function to run the test"""
    test_{test_name.lower().replace(' ', '_')}()

if __name__ == "__main__":
    main()
'''

        return fallback_code


def extract_test_case_fields(text):
    """Extract test case fields from text (existing QA function)"""
    try:
        fields = {}
        fields['test_case_name'] = re.search(r'Test Case:\s*(.+)', text).group(1).strip()
        fields['purpose'] = re.search(r'Purpose:\s*(.+)', text).group(1).strip()
        fields['pre_conditions'] = re.search(r'Pre-conditions:\s*(.+)', text, re.DOTALL).group(1).split('Test Steps:')[
            0].strip()
        fields['test_steps'] = re.search(r'Test Steps:\s*(.+)', text, re.DOTALL).group(1).split('Expected Results:')[
            0].strip()
        fields['expected_results'] = re.search(r'Expected Results:\s*(.+)', text, re.DOTALL).group(1).strip()
        return fields
    except Exception as e:
        print(f"Error extracting test case fields: {e}")
        return None


def extract_user_story_fields(text):
    """Extract user story fields from text"""
    try:
        fields = {}
        fields['id'] = re.search(r'(?:Story ID|ID):\s*(.+)', text).group(1).strip()
        fields['title'] = re.search(r'(?:Title|Story):\s*(.+)', text).group(1).strip()
        fields['description'] = re.search(r'Description:\s*(.*?)(?=\n(?:[A-Z][a-z]+:|$))', text, re.DOTALL).group(
            1).strip()
        fields['acceptance_criteria'] = re.search(r'Acceptance Criteria:\s*(.*?)(?=\n(?:[A-Z][a-z]+:|$))', text,
                                                  re.DOTALL).group(1).strip()
        fields['priority'] = re.search(r'Priority:\s*(.+)', text).group(1).strip() if re.search(r'Priority:\s*(.+)',
                                                                                                text) else 'Medium'
        fields['epic'] = re.search(r'Epic:\s*(.+)', text).group(1).strip() if re.search(r'Epic:\s*(.+)',
                                                                                        text) else 'N/A'
        return fields
    except Exception as e:
        print(f"Error extracting user story fields: {e}")
        return None


def save_script_to_file(code, name, mode='qa'):
    """Save generated script to file"""
    try:
        if mode == 'developer':
            scripts_dir = os.path.join(os.getcwd(), "..", "generated-scripts", "application")
        else:
            scripts_dir = os.path.join(os.getcwd(), "..", "generated-scripts")

        os.makedirs(scripts_dir, exist_ok=True)

        filename = f"{name.lower().replace(' ', '_').replace('-', '_')}.py"
        filepath = os.path.join(scripts_dir, filename)

        with open(filepath, "w", encoding='utf-8') as f:
            f.write(code)

        print(f"[{mode.upper()}] Script saved: {filename}")
        return filepath

    except Exception as e:
        print(f"[ERROR] Failed to save script: {e}")
        return None


def process_test_case_file(filepath, order_index):
    """Process test case file (existing QA function)"""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            test_case_text = file.read()

        fields = extract_test_case_fields(test_case_text)
        if not fields:
            print(f"Failed to extract fields from {filepath}")
            return None

        print(f"Generating test script for: {fields['test_case_name']}")

        # Check for default script first
        script_name = f"{fields['test_case_name'].lower().replace(' ', '_')}.py"
        default_script_path = os.path.join(os.getcwd(), "..", "Backend", "default_scripts", script_name)

        if os.path.exists(default_script_path):
            # Copy default script
            with open(default_script_path, 'r') as src:
                script_content = src.read()
            save_script_to_file(script_content, fields['test_case_name'], mode='qa')
        else:
            # Generate using enhanced generator
            generator = EnhancedCodeGenerator(mode='qa')
            result = generator.generate_test_code(fields)

            if result['success']:
                save_script_to_file(result['code'], fields['test_case_name'], mode='qa')
            else:
                print(f"Failed to generate test code: {result.get('error', 'Unknown error')}")

        print(f"Script generated: {script_name}")

        return {
            'order_index': order_index,
            'script_name': script_name,
            'test_case_name': fields['test_case_name'],
            'source_file': os.path.basename(filepath)
        }

    except Exception as e:
        print(f"Error processing test case file {filepath}: {e}")
        return None


def process_user_story_file(filepath, order_index, codebase_context=None):
    """Process user story file for application code generation"""
    try:
        with open(filepath, 'r', encoding='utf-8') as file:
            story_text = file.read()

        fields = extract_user_story_fields(story_text)
        if not fields:
            print(f"Failed to extract user story fields from {filepath}")
            return None

        print(f"Generating application code for: {fields['title']}")

        # Generate using enhanced generator
        generator = EnhancedCodeGenerator(mode='developer')
        result = generator.generate_application_code(fields, codebase_context)

        if result['success']:
            save_script_to_file(result['code'], fields['id'], mode='developer')
            script_name = result['file_name']
        else:
            print(f"Failed to generate application code: {result.get('error', 'Unknown error')}")
            script_name = f"{fields['id']}_error.py"

        print(f"Application script generated: {script_name}")

        return {
            'order_index': order_index,
            'script_name': script_name,
            'story_id': fields['id'],
            'story_title': fields['title'],
            'source_file': os.path.basename(filepath)
        }

    except Exception as e:
        print(f"Error processing user story file {filepath}: {e}")
        return None


def extract_timestamp_from_filename(filename):
    """Extract timestamp from filename like '20241215_143022123_test1.txt'"""
    try:
        parts = filename.split('_')
        if len(parts) >= 2:
            timestamp_str = parts[0] + parts[1]
            return timestamp_str
        return filename
    except:
        return filename


def save_order_mapping(order_mapping, mode='qa'):
    """Save the order mapping to a JSON file"""
    try:
        if mode == 'developer':
            scripts_dir = os.path.join(os.getcwd(), "..", "generated-scripts", "application")
        else:
            scripts_dir = os.path.join(os.getcwd(), "..", "generated-scripts")

        os.makedirs(scripts_dir, exist_ok=True)
        mapping_file = os.path.join(scripts_dir, "order_mapping.json")

        with open(mapping_file, 'w') as f:
            json.dump(order_mapping, f, indent=2)

        print(f"[{mode.upper()}] Order mapping saved to: {mapping_file}")

    except Exception as e:
        print(f"[ERROR] Failed to save order mapping: {e}")


def determine_processing_mode():
    """Determine whether to process as QA test cases or developer user stories"""
    test_case_dir = os.path.join(os.getcwd(), "..", "test_case")

    if not os.path.exists(test_case_dir):
        print(f"[ERROR] Directory not found: {test_case_dir}")
        return None, []

    # Get all text files
    filenames = []
    for filename in os.listdir(test_case_dir):
        if filename.endswith((".txt", ".rtf")):
            filenames.append(filename)

    if not filenames:
        print("[ERROR] No text files found in test_case directory")
        return None, []

    # Analyze file content to determine mode
    developer_indicators = 0
    qa_indicators = 0

    for filename in filenames[:3]:  # Check first 3 files
        filepath = os.path.join(test_case_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().lower()

            # Count indicators
            if any(indicator in content for indicator in ['user story', 'acceptance criteria', 'epic', 'story id']):
                developer_indicators += 1
            if any(indicator in content for indicator in
                   ['test case', 'test steps', 'expected results', 'pre-conditions']):
                qa_indicators += 1

        except Exception as e:
            print(f"[WARNING] Could not read {filename}: {e}")

    # Determine mode based on indicators
    if developer_indicators > qa_indicators:
        mode = 'developer'
    else:
        mode = 'qa'

    print(f"[INFO] Auto-detected mode: {mode.upper()}")
    print(f"[INFO] Found {len(filenames)} files to process")

    return mode, filenames


def main():
    """Main execution function supporting both QA and Developer workflows"""
    print("=" * 80)
    print("Enhanced Code Generator - Supporting QA Testing & Application Development")
    print("=" * 80)

    # Determine processing mode and get files
    mode, filenames = determine_processing_mode()

    if not mode or not filenames:
        print("[ERROR] No files to process or unable to determine mode")
        return

    test_case_dir = os.path.join(os.getcwd(), "..", "test_case")

    # Sort files by timestamp
    filenames.sort(key=extract_timestamp_from_filename)
    print(f"[INFO] Processing files in order: {filenames}")

    # Load codebase context for developer mode
    codebase_context = None
    if mode == 'developer':
        context_file = os.path.join(os.getcwd(), "..", "codebase_context.json")
        if os.path.exists(context_file):
            try:
                with open(context_file, 'r') as f:
                    codebase_context = json.load(f)
                print(f"[DEVELOPER] Loaded codebase context with {len(codebase_context.get('imports', []))} libraries")
            except Exception as e:
                print(f"[WARNING] Could not load codebase context: {e}")

    # Process files
    order_mapping = []

    for i, filename in enumerate(filenames, 1):
        print(f"\n[INFO] Processing file {i}/{len(filenames)}: {filename}")
        filepath = os.path.join(test_case_dir, filename)

        if mode == 'developer':
            mapping_info = process_user_story_file(filepath, i, codebase_context)
        else:
            mapping_info = process_test_case_file(filepath, i)

        if mapping_info:
            order_mapping.append(mapping_info)

        # Clean up processed file
        try:
            os.remove(filepath)
            print(f"[INFO] Deleted: {filepath}")
        except Exception as e:
            print(f"[WARNING] Error deleting {filepath}: {e}")

    # Save order mapping
    if order_mapping:
        save_order_mapping(order_mapping, mode)
        print(f"\n[SUCCESS] Generated {len(order_mapping)} {mode} scripts:")
        for item in order_mapping:
            if mode == 'developer':
                print(f"  {item['order_index']}. {item['script_name']} - {item['story_title']}")
            else:
                print(f"  {item['order_index']}. {item['script_name']} - {item['test_case_name']}")
    else:
        print("\n[ERROR] No scripts were generated")

    print("\n" + "=" * 80)
    print(f"Enhanced Code Generation Complete - Mode: {mode.upper()}")
    print("=" * 80)


if __name__ == "__main__":
    main()
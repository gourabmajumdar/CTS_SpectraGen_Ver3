import os
import glob
import json
import re
from datetime import datetime


def delete_combined_report():
    combined_report_path = "reports/combinedreport.html"
    if os.path.exists(combined_report_path):
        try:
            os.remove(combined_report_path)
            print(f"Removed file: {combined_report_path}")
        except FileNotFoundError:
            pass
    else:
        print(f"File '{combined_report_path}' does not exist.")


def load_order_mapping():
    """Load the order mapping created by Auto_test_gen.py"""
    mapping_file = os.path.join("generated-scripts", "order_mapping.json")
    if os.path.exists(mapping_file):
        try:
            with open(mapping_file, 'r') as f:
                order_mapping = json.load(f)
            print(f"DEBUG: Loaded order mapping with {len(order_mapping)} entries")
            return order_mapping
        except Exception as e:
            print(f"ERROR: Failed to load order mapping: {e}")
            return None
    else:
        print("WARNING: Order mapping file not found")
        return None


def get_analyzed_scripts():
    """Get list of all analyzed Python scripts using order mapping"""

    # **NEW: Try to use order mapping first**
    order_mapping = load_order_mapping()

    if order_mapping:
        # Use the explicit order from mapping
        script_info = []
        for item in sorted(order_mapping, key=lambda x: x['order_index']):
            script_path = f"generated-scripts/{item['script_name']}"
            if os.path.exists(script_path):
                script_info.append({
                    'file': item['script_name'],
                    'path': script_path,
                    'name': item.get('test_case_name', item.get('story_title', 'Unknown')),
                    'order_index': item['order_index'],
                    'source_file': item['source_file']
                })
                print(f"DEBUG: Test Case {item['order_index']} → {item['script_name']} (from {item['source_file']})")
            else:
                print(f"WARNING: Mapped script not found: {script_path}")

        if script_info:
            print(f"DEBUG: Using order mapping - {len(script_info)} scripts in correct upload order")
            return script_info

    # **FALLBACK: Use alphabetical if no mapping available**
    scripts = glob.glob("generated-scripts/*.py")
    if not scripts:
        print("No scripts found.")
        return []

    # Exclude the mapping file itself and sort alphabetically
    scripts = [s for s in scripts if not s.endswith("order_mapping.json")]
    scripts.sort()

    script_info = []
    for i, script_path in enumerate(scripts, 1):
        script_name = os.path.basename(script_path)
        test_case_name = script_name.replace('.py', '').replace('_', ' ').title()
        script_info.append({
            'file': script_name,
            'path': script_path,
            'name': test_case_name,
            'order_index': i,
            'source_file': 'Unknown'  # No mapping available
        })
        print(f"DEBUG: Test Case {i} → {script_name} (alphabetical fallback)")

    print(f"DEBUG: Using alphabetical fallback - {len(script_info)} scripts")
    return script_info


def read_tool_output(tool_file):
    """Read tool output file and return content"""
    if os.path.exists(tool_file):
        try:
            with open(tool_file, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            return f"Error reading {tool_file}: {e}"
    return ""


def parse_individual_summary_for_tool_status(summary_content):
    """Parse individual summary file to get tool status information"""
    tool_status = {}

    if not summary_content:
        return tool_status

    lines = summary_content.split('\n')
    current_tool = None

    for line in lines:
        line = line.strip()

        # Check for tool section headers with icons
        if any(tool_name in line.upper() for tool_name in ['BLACK', 'FLAKE8', 'BANDIT', 'PYLINT']):
            if ':' in line:
                # Extract the tool name (first word before the dash or colon)
                tool_part = line.split('-')[0].strip() if '-' in line else line.split(':')[0].strip()
                current_tool = tool_part.lower()
                tool_status[current_tool] = {}

                # Check for status icons
                if '✅' in line:
                    tool_status[current_tool]['has_issues'] = False
                    tool_status[current_tool]['status'] = 'Success'
                elif '⚠️' in line or '❌' in line:
                    tool_status[current_tool]['has_issues'] = True
                    tool_status[current_tool]['status'] = 'Issues Found'

        # Parse return code
        elif current_tool and 'Return Code:' in line:
            try:
                return_code = int(line.split('Return Code:')[1].strip())
                tool_status[current_tool]['return_code'] = return_code

                # If no icon was found, determine status from return code
                if 'has_issues' not in tool_status[current_tool]:
                    tool_status[current_tool]['has_issues'] = return_code != 0
                    tool_status[current_tool]['status'] = 'Success' if return_code == 0 else 'Issues Found'
            except (ValueError, IndexError):
                tool_status[current_tool]['return_code'] = 'Unknown'

        # Parse status text
        elif current_tool and 'Status:' in line:
            status = line.split('Status:')[1].strip()
            tool_status[current_tool]['status'] = status

            # If no icon was found, determine has_issues from status text
            if 'has_issues' not in tool_status[current_tool]:
                if 'Issues Found' in status or 'issues found' in status.lower():
                    tool_status[current_tool]['has_issues'] = True
                elif 'Success' in status or 'success' in status.lower():
                    tool_status[current_tool]['has_issues'] = False

    return tool_status


def read_individual_tool_output(tool_name, test_case_number):
    """Read individual tool output for a specific test case"""
    file_map = {
        'flake8': f'reports/flake8_output_{test_case_number}.txt',
        'pylint': f'reports/pylint_output_{test_case_number}.txt',
        'black': f'reports/black_output_{test_case_number}.txt',
        'bandit': f'reports/bandit_output_{test_case_number}.html'
    }

    file_path = file_map.get(tool_name.lower())
    if not file_path:
        print(f"DEBUG: No file mapping for tool {tool_name}")
        return None

    if not os.path.exists(file_path):
        print(f"DEBUG: Individual tool output file not found: {file_path}")
        return None

    try:
        with open(file_path, 'r') as f:
            content = f.read()
        print(f"DEBUG: Successfully read individual {tool_name} output for test case {test_case_number}")
        return content
    except Exception as e:
        print(f"ERROR: Failed to read {file_path}: {e}")
        return None


def get_tool_result_for_test_case(tool_name, test_case_number, individual_summary_status):
    """Get tool result for a specific test case using individual outputs"""

    print(f"DEBUG: Getting {tool_name} result for test case {test_case_number}")
    print(f"DEBUG: Individual summary status: {individual_summary_status}")

    # Get tool status from individual summary
    tool_info = individual_summary_status.get(tool_name.lower(), {})
    has_issues_from_summary = tool_info.get('has_issues', False)
    return_code = tool_info.get('return_code', 0)

    print(f"DEBUG: Tool {tool_name} - has_issues: {has_issues_from_summary}, return_code: {return_code}")

    if not has_issues_from_summary:
        print(f"DEBUG: No issues found for {tool_name} on test case {test_case_number}")
        return {"has_issues": False, "content": "No issues found for this script.", "return_code": return_code}

    # Try to read individual tool output
    individual_output = read_individual_tool_output(tool_name, test_case_number)

    if individual_output and individual_output.strip():
        print(f"DEBUG: Using individual {tool_name} output for test case {test_case_number}")
        return {"has_issues": True, "content": individual_output, "return_code": return_code}
    else:
        print(f"DEBUG: No individual output found for {tool_name} test case {test_case_number}")
        return {
            "has_issues": True,
            "content": f"Issues detected for this script (Return Code: {return_code}), but detailed output could not be retrieved.",
            "return_code": return_code
        }

def create_organized_html_report_with_individual_outputs(output_file):
    """Create HTML report using individual tool outputs for each test case"""
    delete_combined_report()

    # Get all analyzed scripts
    analyzed_scripts = get_analyzed_scripts()

    if not analyzed_scripts:
        print("No analyzed scripts found.")
        return

    # Read main summary content
    main_summary_content = read_tool_output('reports/summary.txt')

    # Read combined tool outputs for collective analysis
    combined_tool_outputs = {
        'flake8': read_tool_output('reports/flake8_output.txt'),
        'pylint': read_tool_output('reports/pylint_output.txt'),
        'black': read_tool_output('reports/black_output.txt'),
        'bandit': read_tool_output('reports/bandit_output.html')
    }

    # Start building HTML
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Multi-Test Code Quality Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }}
        h1 {{ color: #333; border-bottom: 3px solid #007acc; padding-bottom: 10px; }}
        h2 {{ color: #007acc; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }}
        h3 {{ color: #555; margin-top: 25px; }}
        .timestamp {{ color: #666; font-style: italic; }}
        .summary {{ background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007acc; }}
        .test-case {{ background-color: #fafafa; margin: 30px 0; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }}
        .test-case-header {{ background-color: #007acc; color: white; padding: 10px 15px; margin: -20px -20px 20px -20px; border-radius: 8px 8px 0 0; }}
        .tool-section {{ margin: 20px 0; padding: 15px; background-color: white; border-radius: 5px; border-left: 3px solid #ccc; }}
        .tool-section h4 {{ color: #333; margin-top: 0; }}
        .flake8 {{ border-left-color: #ff6b6b; }}
        .pylint {{ border-left-color: #4ecdc4; }}
        .black {{ border-left-color: #45b7d1; }}
        .bandit {{ border-left-color: #f9ca24; }}
        pre {{ background-color: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px; }}
        .no-issues {{ color: #28a745; font-style: italic; }}
        .has-issues {{ color: #dc3545; }}
        .table-of-contents {{ background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .table-of-contents ul {{ margin: 0; padding-left: 20px; }}
        .navigation {{ position: sticky; top: 10px; background-color: #007acc; color: white; padding: 10px; border-radius: 5px; margin-bottom: 20px; }}
        .navigation a {{ color: white; text-decoration: none; margin-right: 15px; }}
        .navigation a:hover {{ text-decoration: underline; }}
    </style>
</head>
<body>
    <div class="navigation">
        <strong>Quick Navigation:</strong>
        <a href="#summary">Summary</a>
        <a href="#test-cases">Test Cases</a>
        <a href="#collective-analysis">Collective Analysis</a>
    </div>

    <h1>Multi-Test Code Quality Analysis Report</h1>
    <p class="timestamp">Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    <p><strong>Total Test Cases Analyzed:</strong> {len(analyzed_scripts)}</p>

    <div id="summary" class="summary">
        <h2>Executive Summary</h2>
        <pre>{main_summary_content if main_summary_content else 'Summary not available.'}</pre>
    </div>

    <div class="table-of-contents">
        <h2>Table of Contents</h2>
        <ul>
"""

    for i, script in enumerate(analyzed_scripts, 1):
        html_content += f'            <li><a href="#test-case-{i}">{script["name"]} ({script["file"]})</a></li>\n'

    html_content += """        </ul>
    </div>

<div id="test-cases">
    <h2>Individual Test Case Analysis</h2>
"""

    # Add individual test case analysis using individual tool outputs
    for i, script in enumerate(analyzed_scripts, 1):
        html_content += f"""
    <div id="test-case-{i}" class="test-case">
        <div class="test-case-header">
            <h3>Test Case {i}: {script['name']}</h3>
            <p><strong>Script File:</strong> {script['file']}</p>
        </div>
"""

        # Read individual summary file for THIS specific script
        individual_summary_path = f'reports/summary{i}.txt'
        individual_summary_content = read_tool_output(individual_summary_path)
        individual_tool_status = parse_individual_summary_for_tool_status(individual_summary_content)

        print(f"DEBUG - Test Case {i} ({script['file']}) tool status: {individual_tool_status}")

        # Add analysis for each tool using individual outputs
        tools = [
            ('flake8', 'Flake8 - Style & Lint Checks', 'PEP 8 compliance and style issues'),
            ('pylint', 'Pylint - Static Code Analysis', 'Code quality and potential bugs'),
            ('black', 'Black - Code Formatting', 'Code formatting analysis'),
            ('bandit', 'Bandit - Security Analysis', 'Security vulnerability scanning')
        ]

        for tool_key, tool_title, tool_desc in tools:
            # NEW: Use individual tool outputs instead of trying to extract from combined
            result = get_tool_result_for_test_case(tool_key, i, individual_tool_status)

            html_content += f"""
        <div class="tool-section {tool_key}">
            <h4>{tool_title}</h4>
            <p><em>{tool_desc}</em></p>
"""

            if result["has_issues"]:
                html_content += f'            <div class="has-issues"><strong>Status:</strong> Issues Found (Return Code: {result["return_code"]})</div>\n'

                # Handle bandit HTML output differently
                if tool_key == 'bandit':
                    html_content += f'            <div>{result["content"]}</div>\n'
                else:
                    html_content += f'            <pre>{result["content"]}</pre>\n'
            else:
                html_content += '            <p class="no-issues">✅ No issues found for this script.</p>\n'

            html_content += '        </div>\n'

        html_content += '    </div>\n'

    html_content += '</div>\n'

    # Add collective analysis section using combined outputs
    html_content += f"""
<div id="collective-analysis">
    <h2>Collective Analysis - All Test Cases</h2>
    <p><em>This section shows the complete output from all analysis tools across all test cases.</em></p>
"""

    collective_tools = [
        ('flake8', 'Flake8 - Complete Output', combined_tool_outputs['flake8']),
        ('pylint', 'Pylint - Complete Output', combined_tool_outputs['pylint']),
        ('black', 'Black - Complete Output', combined_tool_outputs['black']),
        ('bandit', 'Bandit - Complete Output', combined_tool_outputs['bandit'])
    ]

    for tool_key, title, content in collective_tools:
        html_content += f"""
    <div class="tool-section {tool_key}">
        <h3>{title}</h3>
"""
        if content and content.strip():
            if tool_key == 'bandit':
                html_content += f'        <div>{content}</div>\n'
            else:
                html_content += f'        <pre>{content}</pre>\n'
        else:
            html_content += '        <p class="no-issues">No output generated.</p>\n'

        html_content += '    </div>\n'

    html_content += """
</div>

<footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; text-align: center;">
    <p>Report generated by CTS AutoTest Multi-Test Code Review System</p>
</footer>

</body>
</html>
"""

    # Write the final HTML file
    try:
        with open(output_file, 'w', encoding='utf-8') as outfile:
            outfile.write(html_content)
        print(f"Organized HTML report created: {output_file}")
    except Exception as e:
        print(f"Error creating organized report: {e}")


def clean_reports_folder():
    reports_folder = "reports/"
    ignored_files = ["combinedreport.html", "summary.txt"]
    if os.path.exists(reports_folder):
        files_removed = 0
        for filename in os.listdir(reports_folder):
            file_path = os.path.join(reports_folder, filename)
            try:
                if filename in ignored_files:
                    continue
                if filename.startswith("summary"):
                    continue
                if filename.endswith("_output.txt") or filename.endswith("_output.html"):
                    continue
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    files_removed += 1
                    print(f"Removed file: {file_path}")
            except Exception as e:
                print(f"Error removing file {file_path}: {e}")
        print(f"Cleanup completed: {files_removed} temporary files removed")
    else:
        print(f"Reports folder '{reports_folder}' does not exist.")


# Main execution
if __name__ == "__main__":
    output_file = "reports/combinedreport.html"

    print("Starting organized HTML report generation with individual outputs...")

    # Create organized report using individual tool outputs
    create_organized_html_report_with_individual_outputs(output_file)

    # Clean up temporary files (but keep our new individual outputs!)
    clean_reports_folder()

    print("Organized HTML report generation completed!")
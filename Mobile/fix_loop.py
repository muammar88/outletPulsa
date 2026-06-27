import os
import glob
import re

search_dir = r"d:\PROJECT\NODEJS\outletPulsa\Mobile\lib"
count = 0

for root, _, files in os.walk(search_dir):
    for file in files:
        if file.endswith('.dart'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = re.sub(
                r'(if\s*\(\s*loadData\s*==\s*false\s*\)\s*\{)(\s*)(.*?)(?:\s+loadData\s*=\s*true;)',
                r'\1\2loadData = true;\n\2\3',
                content,
                flags=re.DOTALL
            )
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                count += 1
                print(f"Fixed {filepath}")

print(f"Total files fixed: {count}")

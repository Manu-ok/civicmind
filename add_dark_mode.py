import os
import re

directory = r"c:\Users\manis\OneDrive\Documents\civicmind\civicmind-ai\src"

replacements = {
    r'\bbg-zinc-950\b': 'bg-slate-50 dark:bg-zinc-950',
    r'\bbg-zinc-900\b': 'bg-white dark:bg-zinc-900',
    r'\bbg-zinc-800\b': 'bg-slate-100 dark:bg-zinc-800',
    r'\bbg-zinc-700\b': 'bg-slate-200 dark:bg-zinc-700',
    r'\bbg-slate-950/50\b': 'bg-slate-100/50 dark:bg-slate-950/50',
    r'\bbg-slate-900/50\b': 'bg-slate-50/50 dark:bg-slate-900/50',
    r'\bborder-zinc-800\b': 'border-slate-200 dark:border-zinc-800',
    r'\bborder-zinc-700\b': 'border-slate-300 dark:border-zinc-700',
    r'\btext-zinc-400\b': 'text-slate-500 dark:text-zinc-400',
    r'\btext-zinc-300\b': 'text-slate-600 dark:text-zinc-300',
    r'\btext-zinc-500\b': 'text-slate-500 dark:text-zinc-500',
    r'\bborder-white/\[0\.06\]\b': 'border-slate-200 dark:border-white/[0.06]',
}

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                pattern = r'(?<!dark:)' + old
                new_content = re.sub(pattern, new, new_content)
                
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
print("Done")

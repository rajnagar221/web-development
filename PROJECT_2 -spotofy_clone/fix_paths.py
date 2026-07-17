import re
import os

files_to_fix = [
    r'c:\Users\raj\Documents\web-development\PROJECT_2 -spotofy_clone\frontend\index.html',
    r'c:\Users\raj\Documents\web-development\PROJECT_2 -spotofy_clone\frontend\js\modules\ui.js',
    r'c:\Users\raj\Documents\web-development\PROJECT_2 -spotofy_clone\frontend\js\modules\search.js'
]

pattern = re.compile(r'songs/[^"\'>]*\.(jpg|png|svg|webp)')

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = pattern.sub('img/music.svg', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

print("Replacement complete.")

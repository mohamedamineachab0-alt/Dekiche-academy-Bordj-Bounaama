import os

files = [
    "app/page.tsx",
    "components/landing/HeroSection.tsx",
    "components/landing/LeaderboardSection.tsx",
    "components/landing/FeaturesSection.tsx",
    "components/landing/TeamSection.tsx"
]

replacements = {
    "#EAE4D9": "#FFFFFF",
    "#4A5D23": "#4C1D95",
    "#C84B31": "#7E22CE",
    "#1C1C1C": "#000000"
}

for file_path in files:
    full_path = os.path.join(os.getcwd(), file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old_str, new_str in replacements.items():
            content = content.replace(old_str, new_str)
            
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")

import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

# Replace vimeoVideoId String with vimeoVideoId String @default("") and add youtubeVideoId
new_content = re.sub(
    r'(vimeoVideoId\s+String\s*//\s*Vimeo video ID)',
    r'\1\n  youtubeVideoId   String? // YouTube video ID',
    content
)

with open("prisma/schema.prisma", "w") as f:
    f.write(new_content)

## Hi there 👋


from PIL import Image, ImageDraw, ImageFont

# Create a blank canvas
width = 400
height = 300
image = Image.new("RGBA", (width, height), (255, 255, 255, 255))

# Initialize drawing context
draw = ImageDraw.Draw(image)

# Load a TTF font
try:
    font = ImageFont.truetype("arial.ttf", 15)
except IOError:
    font = ImageFont.load_default()

# Add text
text = "주요 기술 및 관심 분야\n저는 주로 다음과 같은 언어를 사용하고 있습니다:"
draw.text((10, 10), text, fill="black", font=font)

# Load badge images from local files (placeholder badges as we cannot download)
# Creating placeholder images for badges
badge_python = Image.new("RGB", (100, 30), color=(55, 118, 171))
badge_js = Image.new("RGB", (100, 30), color=(247, 223, 30))
badge_java = Image.new("RGB", (100, 30), color=(0, 115, 150))
badge_cpp = Image.new("RGB", (100, 30), color=(0, 89, 156))

# Draw placeholder text on badges
draw_badge_python = ImageDraw.Draw(badge_python)
draw_badge_js = ImageDraw.Draw(badge_js)
draw_badge_java = ImageDraw.Draw(badge_java)
draw_badge_cpp = ImageDraw.Draw(badge_cpp)

draw_badge_python.text((10, 10), "Python", fill="white")
draw_badge_js.text((10, 10), "JavaScript", fill="black")
draw_badge_java.text((10, 10), "Java", fill="white")
draw_badge_cpp.text((10, 10), "C++", fill="white")

# Badge images list
badge_images = [badge_python, badge_js, badge_java, badge_cpp]

# Calculate y position for badges
y = 80

# Paste badge images onto the canvas
for badge in badge_images:
    image.paste(badge, (10, y))
    y += badge.size[1] + 10

# Save the final image
output_path = "/mnt/data/programming_languages.png"
image.save(output_path)

output_path

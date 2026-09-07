import pdfplumber

page = pdfplumber.open("work/reference-exports/4_9.pdf").pages[0]
words = page.extract_words()
keys = [
    "HOME",
    "PRODUCTS",
    "PACKAGES",
    "PROJECTS",
    "ABOUT US",
    "CONTACT US",
    "OUR SERVICE CATALOGUE",
    "THRIVABLE BUSINESS",
    "BUSINESS LEADERSHIP",
    "TECHNOCRATIC DESIGN",
    "EXECUTION MANAGEMENT",
    "WHY CHOOSE US?",
    "PORTFOLIO",
    "PEOPLE",
    "DESIGN TOOLKITS",
    "PARTNERS",
    "TESTIMONIAL",
    "WHAT IF...",
]

for key in keys:
    tokens = key.split()
    matches = []
    for index in range(len(words) - len(tokens) + 1):
        text = " ".join(word["text"].upper() for word in words[index : index + len(tokens)])
        if text == key:
            first = words[index]
            matches.append((round(first["x0"], 1), round(first["top"], 1), text))
    print(key, matches[:8])

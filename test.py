import xml.etree.ElementTree as ET
from pathlib import Path

# Register the namespace to use the default namespace (no prefix)
ET.register_namespace('', "http://www.sitemaps.org/schemas/sitemap/0.9")

# Configuration
INPUT_FILE = "pin-sitemap.xml"  # Replace with your input XML file
OUTPUT_DIR = "split_sitemaps"
URLS_PER_FILE = 30000

# Ensure output directory exists
Path(OUTPUT_DIR).mkdir(exist_ok=True)

# Parse the XML file
tree = ET.parse(INPUT_FILE)
root = tree.getroot()

# Namespace
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

# Get all URL elements
urls = list(root.findall("sm:url", ns))
total_urls = len(urls)

print(f"Total URLs found: {total_urls}")
print(f"Splitting into chunks of {URLS_PER_FILE} URLs...")

# Split and write to new files
file_index = 0
for i in range(0, total_urls, URLS_PER_FILE):
    chunk = urls[i:i + URLS_PER_FILE]
    file_index += 1
    output_file = Path(OUTPUT_DIR) / f"sitemap_part_{file_index}.xml"

    # Create a new root for the chunk using the correct namespace
    new_root = ET.Element(
        "urlset",
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    )

    for url in chunk:
        # Deep copy each url element without namespace prefixes
        new_url = ET.Element("url")
        for child in url:
            tag = child.tag.split('}', 1)[-1]  # Remove namespace if any
            new_child = ET.SubElement(new_url, tag)
            new_child.text = child.text.strip() if child.text else ""
        new_root.append(new_url)

    # Write to file
    new_tree = ET.ElementTree(new_root)
    new_tree.write(
        output_file,
        encoding="utf-8",
        xml_declaration=True,
        method="xml"
    )
    print(f"Wrote {len(chunk)} URLs to {output_file}")

print("✅ Done splitting sitemap.")
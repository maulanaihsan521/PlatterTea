#!/bin/bash
# Generate PlatterTea product images matching mockup style
cd /home/z/my-project

mkdir -p public/products

STYLE="professional food photography, warm natural lighting, cream beige background, fresh green leaves decoration, appetizing, high quality, commercial food shot for F&B brand"

# 1. Hero - platter + tea cups
z-ai image -p "dark green takeaway food box filled with fried chicken balls, french fries, mini sausages, and a cup of white mayonnaise dip, next to two tall clear plastic cups of orange amber iced milk tea with straws, $STYLE" -o public/products/hero.png -s 1344x768

# 2. Platter Only
z-ai image -p "dark green takeaway food box filled with golden fried chicken balls, french fries, sliced mini sausages and small cup of mayonnaise dip, top-down 45 degree angle, $STYLE" -o public/products/platter-only.png -s 1024x1024

# 3. Tea Only
z-ai image -p "single tall clear plastic cup of orange amber iced sweet tea with sealed lid and straw, condensation droplets, refreshing, $STYLE" -o public/products/tea-only.png -s 1024x1024

# 4. Combo
z-ai image -p "dark green takeaway food box with fried chicken balls, fries, sausages and mayo dip, next to one tall cup of orange iced tea, combo meal set, $STYLE" -o public/products/plattertea-combo.png -s 1024x1024

# 5. Bestie Combo
z-ai image -p "two dark green takeaway food boxes with fried snacks and two tall cups of orange iced milk tea, sharing combo set for two people, $STYLE" -o public/products/bestie-combo.png -s 1024x1024

# 6-9. Tea variants
z-ai image -p "tall clear plastic cup of classic orange iced tea with ice cubes, original sweet tea, sealed lid and straw, $STYLE" -o public/products/original-tea.png -s 1024x1024

z-ai image -p "tall clear plastic cup of pink creamy yakult iced tea drink with small bottle of yakult beside it, sealed lid and straw, $STYLE" -o public/products/yakult-tea.png -s 1024x1024

z-ai image -p "tall clear plastic cup of teh tarik pulled milk tea, frothy creamy brown tea, sealed lid and straw, $STYLE" -o public/products/teh-tarik.png -s 1024x1024

z-ai image -p "tall clear plastic cup of brown milk tea with condensed milk swirls, teh susu, sealed lid and straw, $STYLE" -o public/products/teh-susu.png -s 1024x1024

# 10. Brand intro image
z-ai image -p "dark green takeaway food box with fried chicken balls fries sausages mayo dip, two orange iced tea cups with green leaf logo, cream background with fresh green leaves, brand product shot, $STYLE" -o public/products/brand-intro.png -s 1152x864

# 11. Booth / event photo
z-ai image -p "cozy small F&B market booth with dark green and cream branding, banner, display of snack platters and iced tea cups, outdoor campus market, warm daylight, people friendly atmosphere, high quality" -o public/products/booth.png -s 1152x864

echo "ALL IMAGES DONE"
ls -la public/products/

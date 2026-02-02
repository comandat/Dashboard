# Folosim o imagine mică și rapidă de Nginx
FROM nginx:alpine

# Copiem fișierul de configurare standard (opțional, dar recomandat pentru SPA-uri)
# Dacă nu ai nevoie de rewrite-uri speciale, linia următoare e suficientă:
COPY . /usr/share/nginx/html

# Nginx expune portul 80 implicit
EXPOSE 80

# Pornim serverul
CMD ["nginx", "-g", "daemon off;"]

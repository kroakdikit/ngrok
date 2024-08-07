# Gunakan image Portainer terbaru sebagai base image
FROM portainer/portainer-ce:latest

# Set environment variables (opsional)
ENV PORTAINER_PORT=9443
ENV PORTAINER_DATA=/data

# Expose port 9443 untuk Portainer UI
EXPOSE 9443

# Buat volume untuk data Portainer
VOLUME ["/data"]

# Jalankan Portainer pada port default
CMD ["portainer", "--host", "0.0.0.0", "--port", "9443"]

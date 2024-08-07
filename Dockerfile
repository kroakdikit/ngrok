# image Portainer
FROM portainer/portainer-ce:latest

# Expose port 9443
EXPOSE 9443

# Run
CMD ["portainer", "--host", "0.0.0.0"]


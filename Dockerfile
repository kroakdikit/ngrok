# image Portainer
FROM portainer/portainer-ce:latest

# port 9443
EXPOSE 9443

# Portainer
ENTRYPOINT ["/portainer"]
CMD ["--no-analytics"]

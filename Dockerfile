FROM node:22-alpine
ENV NODE_ENV=production IFA_DATA=/data IFA_PORT=8080
WORKDIR /app
COPY server.js package.json ./
COPY public ./public
COPY bundle ./bundle
COPY scripts ./scripts
RUN node scripts/restore.js && rm -rf bundle
RUN addgroup -S ifa && adduser -S ifa -G ifa && mkdir -p /data && chown ifa:ifa /data
USER ifa
VOLUME ["/data"]
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -qO- http://127.0.0.1:8080/api/health >/dev/null || exit 1
CMD ["node","--experimental-sqlite","--no-warnings","server.js"]

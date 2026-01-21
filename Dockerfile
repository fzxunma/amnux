FROM harbor.zncode.com/common/ubuntu:24.04.3
ENV DENO_INSTALL="/usr/local"
COPY apps /data/wwwroot/apps
COPY data /data/wwwroot/data
COPY packages /data/wwwroot/packages
COPY deno.json /data/wwwroot/deno.json
WORKDIR /data/wwwroot
RUN apt-get update && apt-get install -y curl unzip && curl -fsSL https://deno.land/install.sh | sh && deno install
RUN deno install
CMD ["deno", "task", "web"]

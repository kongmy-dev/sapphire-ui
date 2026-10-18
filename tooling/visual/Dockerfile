ARG BUN_VERSION
ARG PLAYWRIGHT_VERSION
FROM oven/bun:${BUN_VERSION} AS bun

FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
RUN ln -s bun /usr/local/bin/bunx
ENV SAPPHIRE_PIN_CONTAINER=1
WORKDIR /work

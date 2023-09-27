# Use the K6 Docker image as base
FROM grafana/k6

COPY ./dist /dist

ENV K6_PROMETHEUS_RW_SERVER_URL=http://192.168.49.1:9090/api/v1/write
ENV K6_PROMETHEUS_RW_TREND_STATS=p(95),p(99),min,max
RUN ls -la
ENTRYPOINT k6 run /dist/test.js -o experimental-prometheus-rw --tag "testid=$(date +%d-%m-%Y@%H:%M:%S:%M)"

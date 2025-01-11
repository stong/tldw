# TL;DW

Too Long; Didn't Watch!

<img width="720" alt="image" src="https://github.com/user-attachments/assets/b9209b0b-f856-4937-9238-bdbce7486dff" />

# Deploying

Set the variables in .env:

```
OPENAI_API_KEY=sk-proj-xxxxxx...
PROXY_URL=https://user:pass@your-proxy-provider-here.com:8888
```

Variable `PROXY_URL` is optional but recommended for production deployments, recommend using a residential or LTE proxy.

Then:

```
docker-compose up -d
```

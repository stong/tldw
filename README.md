# [TL;DW](https://tldw.tube)

Too Long; Didn't Watch!

<img width="720" alt="image" src="https://github.com/user-attachments/assets/b9209b0b-f856-4937-9238-bdbce7486dff" />

# How to use

- Go to https://tldw.tube or run locally (recommended)
- Enter video URL
- Go

Running locally is recommended because hosted version have strict rate limit, as it rely on residential proxy and OpenAI API which costs me money.

# Deploying

Set the variables in .env:

```
OPENAI_API_KEY=sk-proj-xxxxxx...
PROXY_URL=https://user:pass@your-proxy-provider-here.com:8888
MAX_VIDEO_DURATION=7200
```

Variables:
- `PROXY_URL` is optional but recommended for production deployments, recommend using a residential or LTE proxy.
- `MAX_VIDEO_DURATION` is optional, defaults to 7200 (2 hours). Videos longer than this will be rejected.

Then:

```
docker-compose up -d
```

# Local development

- prepare `.env` file
- `python3 -m virtualenv venv ; source venv/bin/activate`
- `pip install -r requirements.txt`
- launch backend `python backend.py &`
- If needed, edit backend url in `App.tsx`
- frontend setup `cd youtube-summarizer ; yarn install ; yarn dev`

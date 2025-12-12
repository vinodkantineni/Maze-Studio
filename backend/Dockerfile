# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install OS deps (if any) and pip packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend + frontend (so Flask can serve static files if desired)
COPY . /app

ENV PORT=5000
EXPOSE 5000

# Use gunicorn in production
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:5000", "--workers", "2", "--timeout", "120"]

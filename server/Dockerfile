FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the server files
COPY . .

# Expose port 7860 for Hugging Face Spaces
EXPOSE 7860

# Run the server
CMD ["python", "stream_server.py"]

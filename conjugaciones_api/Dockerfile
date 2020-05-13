FROM python:3.7-slim
RUN apt-get update && apt-get install build-essential python vim curl -y

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade -r /app/requirements.txt

COPY . .
FROM python:3.7-slim
RUN apt-get update
RUN apt-get install build-essential python vim curl -y

WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade -r /app/requirements.txt
# COPY . /backend
# WORKDIR /backend/
# RUN cd /backend && pip install --upgrade pip && pip install -r requirements.txt
# RUN mkdir /www && mkdir /www/static
# RUN mkdir /etc/nginx
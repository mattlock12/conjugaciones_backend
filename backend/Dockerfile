FROM python:3.7-slim
RUN apt-get update
RUN apt-get install -y build-essential python
COPY . /app
WORKDIR /app/
RUN cd /app && pip install --upgrade pip && pip install -r requirements.txt
RUN mkdir /www && mkdir /www/static
RUN mkdir /etc/nginx
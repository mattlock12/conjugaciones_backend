FROM python:3.7-slim
COPY . /app
WORKDIR /app/
RUN cd /app && pip install -r requirements.txt
RUN mkdir /www && mkdir /www/static
RUN mkdir /etc/nginx
FROM python:3.7-slim
COPY . /app
WORKDIR /app/
RUN cd /app && pip install -r requirements.txt
CMD ["python", "/app/application.py"]
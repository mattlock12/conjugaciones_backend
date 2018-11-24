FROM python:3.7-slim

WORKDIR app/

COPY . /app

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["python", "application.py"]
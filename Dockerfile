FROM python:3.7-slim
RUN mkdir /app
WORKDIR /app/
ADD . /app
RUN pip install -r requirements.txt
RUN python scripts/setup_db.py
EXPOSE 8000
CMD ["python", "application.py"]
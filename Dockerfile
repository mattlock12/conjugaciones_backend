FROM python:3.7-slim
RUN mkdir /app
ADD . /app
RUN cd /app && pip install -r requirements.txt
EXPOSE 8000
WORKDIR /app/
RUN yarn install
RUN npm run build
CMD ["python", "/app/application.py"]
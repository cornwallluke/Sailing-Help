docker build . -t cornwallluke/test
docker run -p 80:5000 --env-file .env cornwallluke/test
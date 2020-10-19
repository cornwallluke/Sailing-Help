docker build . --cache-from cornwallluke/test -t cornwallluke/test
docker run -p 80:5000 --env-file .env cornwallluke/test
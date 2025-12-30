Windows:

step1: run musite in your local
1. Install docker desktop in your local 
2. Ask me to get the "docker-compose.yml"
3. In the same directory, open terminal, run "docker compose up"


step2: development
Copy the code from docker to your local: 
1. run "docker cp <container_id>:<container_path> <local_path>"  
docker cp b697cb5cac16:/web/. C:/Users/yqzn9/Documents/GitHub/musite/web
docker cp 248f073474dc:/web/public C:/Users/yqzn9/Documents/GitHub/musite/web/public


2.You can then use docker volumes to map your local folder to the container folder by changing your docker compose file

docker exec 8102150b3f93 rm -rf /web/src
docker cp /home/yqzn9/musite_web/web/src 8102150b3f93:/web/src
docker restart 825553bc78c9

Access to docker container:
docker exec -it 825553bc78c9 /bin/bash


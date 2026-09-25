# project = node.js+ nginx

 node -v
 npm -v 

#  Node.js project initialize 

npm init -y 

# packages install

npm install express # inside package.json dependency record , Node.js use  HTTP server Express use



# server.js

vim server.js = server.js → Node.js application code

# Node.js application start

node server.js

# PM2 = Node.js Process Manager = run our application on backgrond, if our terminal/seeion close still its run

# PM2 install 
sudo npm install -g pm2

# Check:
pm2 -v

# PM2 se Node.js start

pm2 start server.js --name shopsphere-frontend


pm2 delete shopshere-frontend
pm2 start server.js --name shopsphere-frontend
pm2 status


# Next 

# Nginx install

sudo apt update
sudo apt install nginx -y
nginx -v
sudo systemctl status nginx
sudo systemctl enable nginx

# Nginx  browser  test

http://localhost

sudo tail  -20 /var/log/nginx/error.log

sudo systemctl reload nginx

sudo systemctl status nginx --no-pager

# PM2 logs

pm2 logs shopsphere-frontend --lines 30

cat /home/sun/.pm2/logs/shopsphere-frontend-error.log


pm2 restart shopsphere-frontend
pm2 status


# Frontend UI structure

# public folders

mkdir -p public/css public/js

# index.html

pm2 restart shopsphere-frontend


# JAVA BACKEND

cd ~/shopsphere-ecommerce/backend
java -version
mvn -version

mvn dependency:resolve # mainly dependencies ko resolve/download

mvn dependency:go-offline # offline build ke liye prepare karta hai:

mvn clean package # First build

# Backend start

mvn clean package



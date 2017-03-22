# Cartoscope-backend


1.  git clone https://github.com/crowdgames/Cartoscope-backend.git

2.  #### Windows installation
		Windows users follow the link: http://blog.teamtreehouse.com/install-node-js-npm-windows
	
		 
3. #### OSX installation
		osx users need to follow the given steps :
		 a) Install brew.
		 b) brew install node
		 c) Install nginx using brew.
		 d) brew install mysql
		 e) Install wget using homebrew: http://stackoverflow.com/questions/33886917/how-to-install-wget-in-macos-capitan-sierra 
	
3. start mysql: mysql.server start

4. open mysql console using sudo mysql

5.  #### Run the following sql commands on the mysql shell
		CREATE USER 'converge'@'localhost' IDENTIFIED BY 'PassWord';
		GRANT ALL PRIVILEGES ON * . * TO 'converge'@'localhost';
		CREATE DATABASE convergeDB;
		
6. #### Run the following command to reset the password of any user (if required).
		ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyNew 

7. #### Unpack mysql database dump
		Go to Cartoscope-backend directory and run to create mysql database.
			mysql -u converge -p convergeDB < database_migrations/dump.sql

8. #### Create temp and dataset directories
		Go to Cartoscope-backend directory and run
        	mkdir temp
			mkdir dataset

9. #### Set environment variables in bashrc
		export DB_USER=converge                                                         
		export DB_PASSWORD=database_password                                                     
		export DB_NAME=convergeDB                                                       
		export MAILER='xyz@abc.com'                                         
		export SALT='$$$$$$$$$$$$$$$$$$$$$$'
		
10. #### Python related installations:
		install pip and then PIL
		sudo easy_install pip
		Sudo pip install pillow

11. #### Setting up ngnix.conf
		1. sudo nginx -t to find path of ngnix.conf
		2. Replace your ngnix.conf with the following code.
				events {                                                                        
    				worker_connections  1024;                                                   
				}                                                                               
                                                                                
				http {                                                                          
				  include  mime.types;                                               
				  gzip  on;                                                               
				  server {                                                                    
					listen 8081;                                                    
					location / {                                                    
					  root /XXXXX/converge-frontend;
					}                                                               
					location /cmnh {                                                
					  rewrite ^/.* /#/museum permanent;                            
					}                                                               
					location /login {                                                       
					  rewrite ^/.* /#/login permanent;                                     
					}                                                                      
					location /api/ {                                                
					   proxy_pass http://localhost:3000;                       
					}                                                               
				 }                                                                           
			} 
			/XXXXX/converge-frontend is the absolute path to the front end repository for the project
			
		3. Sudo ngnix -s quit to stop
		4. Sudo ngnix to start with new conf file.
		5. Sudo ngnix -s reload to reload with a new conf when ngnix is already running

12. #### Start Project
		1. Go to Cartoscope-backend directory and run npm start
		2. Login to http://localhost:8081 to start


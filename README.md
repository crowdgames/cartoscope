# Installation Instructions


1.  git clone https://github.com/crowdgames/cartoscope-backend.git


2.  Install Node, MySQL and Wget:
	1. ##### Windows installation
		1. Windows users follow the link to install Node: http://blog.teamtreehouse.com/install-node-js-npm-windows
		2. When installing MySQL server, make sure the **lower_case_table_names is set to 2 and that passwords use Legacy Authentication Method is selected**
		3. Make sure wget is in your path.
	
		 
	2. #### OSX installation
		OSX users need to follow the given steps:
		 1. Install brew.
		 2. brew install node
		 3. Install nginx using brew.
		 4. brew install mysql
		 5. Install wget using homebrew: http://stackoverflow.com/questions/33886917/how-to-install-wget-in-macos-capitan-sierra 
	
3. Start mysql: mysql.server start

4. Open mysql console using sudo mysql

5.  #### Run the following sql commands on the mysql shell
		CREATE USER 'converge'@'localhost' IDENTIFIED BY 'PassWord';
		GRANT ALL PRIVILEGES ON * . * TO 'converge'@'localhost';
		CREATE DATABASE convergeDB;
		
6. #### Run the following command to reset the password of any user (if required).
		ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyNewPassword'; 

7. #### Create the necessary tables
		Go to cartoscope-backend directory and run to create mysql database.
			mysql -u converge -p convergeDB < database_migrations/dump.sql

8. #### Create directories
		Go to cartoscope-backend directory and run
        	mkdir temp
			mkdir dataset
			mkdir profile_photos
8. #### Setup SSL Certificates:
	Cartoscope requires SSL certificates for running on HTTPS. For creating self-signed certificates for testing purposes, follow this link: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs

9. #### Set environment variables in bashrc (replace with your values)
		export CARTO_DB_USER=converge                                                         
		export CARTO_DB_PASSWORD=database_password                                                     
		export CARTO_DB_NAME=convergeDB                                                       
		export CARTO_MAILER='xyz@abc.com'                                         
		export CARTO_SALT='$$$$$$$$$$$$$$$$$$$$$$'
		export CARTO_PORT=80
		export CARTO_PORT_SSL=443
		CARTO_SSL_KEY='path/to/your/certificate.key'
		CARTO_SSL_CRT='path/to/your/certificate.crt'
		
10. #### Python related installations:
		Make sure pip is installed and then intall PIL
		sudo easy_install pip
		Sudo pip install pillow

11. #### Install required npm modules for backend and frontend:
		cd cartoscope-backend
		npm install
		cd ./public
		bower install
12. To facilitate development, also install nodemon:https://nodemon.io/

12. #### Start Server
		cd ../cartoscope-backend
		nodemon app
		
13. #### Setup Users etc.
	1. Your main page is at http://localhost:CARTO_PORT (where CARTO_PORT is the port specified in the environment variables)
	2. For the remainder of the instructions, we will use port 8081 as the selected port:
	3. In order to start setting up projects, you will need to register a user by going to http://localhost:8081/#/login
	4. Make sure your registered user's name is `cartoproject` for project creation privileges to apply.
	5. Login with the user and create a project
	6. **Caution** The current setup does not provide a graphical interface for creating project tutorials. This can be accomplished by adding the image files to the `cartoscope_backend/public/images/Tutorials/` folder and adding the relevant information to the 
	


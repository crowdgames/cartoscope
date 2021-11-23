# Installation Instructions


1.  `git clone https://github.com/crowdgames/cartoscope.git`


2.  Install Node, MySQL and Wget (note, the node version may matter. For me (Kutub), node 10.19.0 works but 15.9.0 does not. I'm unsure if that is an issue I have or if it is relevant to this whole project):
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
	3. #### Debian / Ubuntu
		 1. `sudo apt install nodejs mysql-server wget`
	
3. Start mysql: mysql.server start (On Ubuntu: `sudo service mysql start` or `sudo systemctl mysql start` )

4. Open mysql console using `sudo mysql` (if root user is created, you may need to do `sudo mysql -u root -p`)

5.  #### Run the following sql commands on the mysql shell
```
CREATE USER 'converge'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'converge'@'localhost';
CREATE DATABASE convergeDB;
```
		
6. #### Run the following command to reset the password of any user (if required).
		ALTER USER 'root'@'localhost' IDENTIFIED BY 'MyNewPassword'; 

7. #### Create the necessary mysql database. In the cartoscope backend directory:
`mysql -u converge -p convergeDB < database_migrations/dump.sql`

8. #### Create directories. In the cartoscope backend directory:
```
mkdir temp
mkdir dataset
```
8. #### Setup SSL Certificates:
	
Cartoscope requires SSL certificates for running on HTTPS. Run this command: 
```
openssl req \
       -newkey rsa:2048 -nodes -keyout domain.key \
       -x509 -days 365 -out domain.crt
```
For more information, follow this link: https://www.digitalocean.com/community/tutorials/openssl-essentials-working-with-ssl-certificates-private-keys-and-csrs

9. #### Environment Variables 

Set up environment varaibles in bashrc (replace with your values. For a test / personal use, consider 8081, 8082 as the PORTS)

```
export CARTO_DB_USER=converge                                                         
export CARTO_DB_PASSWORD=password                                                     
export CARTO_DB_NAME=convergeDB                                                       
export CARTO_MAILER='xyz@abc.com'                                         
export CARTO_SALT='$$$$$$$$$$$$$$$$$$$$$$'
export CARTO_PORT=80
export CARTO_PORT_SSL=443
export CARTO_SSL_KEY='path/to/your/certificate.key'
export CARTO_SSL_CRT='path/to/your/certificate.crt'
```

By default the server will redirect all routes to https. If you are developing on a VM, this may be inconvenient. You can remove redirect when testing locally with:

```
export CARTO_DEV='development'
```

When deploying the server, ensure that `CARTO_DEV` is not set to 'development'. Lastly, you also need to handle [intermediate certificates](https://www.godaddy.com/help/what-is-an-intermediate-certificate-868) for ssl verification. If you do not run this step on the server, than all https requests from a non-browser based system will fail.

```
export CARTO_CA_BUNDLE='path/to/your/cartoscope.ca.:.crt'
```

In this case, the formatting is important since there should be three values where `:` is. The code replaces `:` with numbers 1, 2, and 3. If you are coming into the project to set up a new ssl cert, GoDaddy will have one file with "bundle" in it. That file will contain three separate certificates which start with "-----BEGIN CERTIFICATE-----" and end with "-----END CERTIFICATE-----".
		
10. #### Python related installations:
		Make sure pip is installed and then intall PIL
		sudo easy_install pip
		Sudo pip install pillow

11. #### Install required npm modules for backend and frontend:
		cd cartoscope-backend
		npm install -g bower
		npm install
		cd ./public
		bower install
12. To facilitate development, also install nodemon and typescript with ```npm install -g nodemon typescript```

14. #### Start Server
		cd ../cartoscope-backend
		nodemon app

14. #### Start automatic typescript compilation
		tsc --watch

If you are on the cartoscope server, `tsc` will generate typescript files. 
		
15. #### Setup Users etc.
	1. Your main page is at http://localhost:CARTO_PORT (where CARTO_PORT is the port specified in the environment variables)
	2. For the remainder of the instructions, we will use port 8081 as the selected port:
	3. In order to start setting up projects, you will need to register a user by going to http://localhost:8081/#/login
	4. Make sure your registered user's name is `cartoproject` for project creation privileges to apply.
	5. Ensure that is_creator=1 for your user in the convergeDB database, table "users". Set is_creator=1 if not so
	6. Login with the user and create a project
	7. **Caution** The current setup does not provide a graphical interface for creating project tutorials. This can be accomplished by adding the image files to the `cartoscope_backend/public/images/Tutorials/` folder and adding the relevant information to the 

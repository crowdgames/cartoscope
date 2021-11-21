### get config

cd /vagrant

if [ -e "config-auth.sh" ]; then
    source config-auth.sh
else
    echo "Note: using config-auth.sh.example for provisioning."
    source config-auth.sh.example
fi



### pre-configure root password for mysql-server install

echo mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD | sudo debconf-set-selections
echo mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD | sudo debconf-set-selections



### install packages

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update

sudo apt-get -y install mysql-client mysql-server
sudo apt-get -y install nginx-light
sudo apt-get -y install nodejs-legacy
sudo apt-get -y install npm
sudo apt-get -y install python-setuptools

sudo apt-get -y install emacs24-nox

sudo easy_install pip
sudo pip install pillow

sudo npm install -g bower

### setup database

echo "CREATE DATABASE convergeDB;" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "CREATE USER 'converge'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "GRANT ALL PRIVILEGES ON convergeDB.* TO 'converge'@'localhost';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
mysql convergeDB -u converge -p$MYSQL_USER_PASSWORD < /vagrant/database_migrations/dump.sql

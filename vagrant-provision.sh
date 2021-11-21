# install packages

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update

sudo apt-get -y install mysql-client mysql-server
sudo apt-get -y install nodejs
sudo apt-get -y install npm
sudo apt-get -y install python-pip
sudo apt-get -y install wget

sudo pip install pillow

# npm installs

sudo npm i -g n

sudo n 7.8.0

PATH="$PATH"

sudo npm install -g bower

# Go to appropriate directory
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

### setup database

echo "CREATE DATABASE convergeDB;" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "CREATE USER 'converge'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "GRANT ALL PRIVILEGES ON convergeDB.* TO 'converge'@'localhost';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
mysql convergeDB -u converge -p$MYSQL_USER_PASSWORD < /vagrant/database_migrations/dump.sql

mkdir temp
mkdir dataset

npm i

cd ./public
bower install

npm i -g nodemon typescript

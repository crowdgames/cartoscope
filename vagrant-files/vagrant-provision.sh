cd /vagrant

if [ -e "config-auth.sh" ]; then
    source config-auth.sh
else
    echo "Note: using config-auth.sh.example for provisioning."
    source config-auth.sh.example
fi

echo "== Preconfiguring mysql server install =="

echo mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD | sudo debconf-set-selections
echo mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD | sudo debconf-set-selections

echo "== Installing major packages =="

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update

sudo apt-get -y install mysql-client mysql-server
sudo apt-get -y install nodejs
sudo apt-get -y install npm
sudo apt-get -y install python-pip
sudo apt-get -y install wget
sudo apt-get -y install openssl

sudo pip install pillow

echo "== Installing appropriate node version =="

sudo npm i -g n

sudo n 10.19.0

PATH="$PATH"

sudo npm install -g bower

echo "== Creating databases =="

echo "CREATE DATABASE convergeDB;" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "CREATE USER 'converge'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "GRANT ALL PRIVILEGES ON convergeDB.* TO 'converge'@'localhost';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
mysql convergeDB -u converge -p$MYSQL_USER_PASSWORD < /vagrant/database_migrations/dump.sql

mkdir temp
mkdir dataset


openssl req -batch -newkey rsa:2048 -nodes -keyout domain.key -x509 -days 365 -out domain.crt

echo "== Installing python3.6 =="

sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get -y install python3.6

echo "== Installing node modules =="

npm config set python /usr/bin/python3.6
npm i

cd ./public
bower install

npm i -g nodemon typescript

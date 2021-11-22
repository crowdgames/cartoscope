cd /vagrant

echo "== READING DB AUTH CONFIG =="

if [ -e "config-auth.sh" ]; then
    source config-auth.sh
else
    echo "Note: using config-auth.sh.example for provisioning. It is recommended to copy / edit this file into config-auth.sh"
    source config-auth.sh.example
fi

echo "== PRECONFIGURING MYSQL SERVER INSTALL =="

echo mysql-server mysql-server/root_password password $MYSQL_ROOT_PASSWORD | sudo debconf-set-selections
echo mysql-server mysql-server/root_password_again password $MYSQL_ROOT_PASSWORD | sudo debconf-set-selections

echo "== INSTALLING MAJOR PACKAGES =="

export DEBIAN_FRONTEND=noninteractive

sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update

sudo apt-get -y install \
  python3.6 python-pip python3-pip \
  mysql-client mysql-server \
  nodejs npm \
  wget \
  openssl \
  build-essential libffi-dev python3-dev

echo "== INSTALLING PYTHON PACKAGES =="

sudo pip install pillow
/usr/bin/python3.6 -m pip install bcrypt

echo "== INSTALLING APPROPRIATE NODE VERSION =="

sudo npm i -g n

sudo n 10.19.0

PATH="$PATH"

echo "== CREATING DATABASES =="

echo "CREATE DATABASE convergeDB;" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "CREATE USER 'converge'@'localhost' IDENTIFIED BY '$MYSQL_USER_PASSWORD';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
echo "GRANT ALL PRIVILEGES ON convergeDB.* TO 'converge'@'localhost';" | mysql -u root -p$MYSQL_ROOT_PASSWORD
mysql convergeDB -u converge -p$MYSQL_USER_PASSWORD < /vagrant/database_migrations/dump.sql

echo "== CREATING FOLDERS =="

mkdir temp
mkdir dataset

echo "== CREATING SSL KEYS AND CERTS =="

openssl req -batch -newkey rsa:2048 -nodes -keyout domain.key -x509 -days 365 -out domain.crt

echo "== SETTING UP ENV VARIABLES =="

cat vagrant-files/envs.sh >> /home/vagrant/.bashrc
/usr/bin/python3.6 vagrant-files/salt_generator.py >> /home/vagrant/.bashrc

echo "== INSTALLING NODE MODULES =="

npm config set python /usr/bin/python3.6
sudo npm i
sudo npm i -g nodemon typescript bower

echo "== INSTALLING BOWER MODULES =="

cd ./public
bower install

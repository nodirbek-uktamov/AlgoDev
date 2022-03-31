# Server setup

## Setup server (Debian 10) 
### Install git and clone repository  
1. Install git `sudo apt update` `sudo apt install -y git` and check `git --version`
2. Generate deploy key `ssh-keygen -o -t rsa -b 4096 -C "botcommerce"`
3. Go to Settings > Deploy keys, add new deploy key. `cat .ssh/id_rsa.pub`
4. Clone repo


### Install PostgreSQL and Setup  
1. Install `sudo apt install -y postgresql-11` (run it if needed `sudo systemctl start postgresql@11-main`)
2. Change user `sudo su - postgres`
3. Create new user `createuser --interactive --pwprompt`
4. Create database `createdb -O username botcommerce`
5. Logout from postgres role `exit`  

(you can login into database using `psql -U username -d botcommerce -h localhost`)

### Setup python and run application
_Debian 10 already has python3_ so we dont need do anything with it
1. Install pip3 `apt install -y python3-pip`
2. Make python3 default add  `alias python="python3"` and `alias pip="pip3"` to ~/.bashrc
2. Go to backend `cd project_folder/backend`
3. Install dependencies `pip install -r requirements.txt`
4. Copy settings_prod.py.example as settings_prod.py and change it as you need
5. Add `export DJANGO_SETTINGS_MODULE=config.settings_prod` to ~/.bashrc file
6. Collect statics `python manage.py collectstatic --no-input`
7. Migrate changes `python manage.py migrate`

### Gunicorn, Nginx, SSL
1. Open `nano /etc/systemd/system/gunicorn.socket` and write
```
[Unit]
Description=gunicorn socket
[Socket]
ListenStream=/run/gunicorn.sock
[Install]
WantedBy=sockets.target
``` 
2. Open `nano /etc/systemd/system/gunicorn.service` and put
```
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/home/AlgoDev/backend
ExecStart=daphne -b 194.163.164.243 -p 8000 config.asgi:application

[Install]
WantedBy=multi-user.target
```
3. Run `sudo systemctl start gunicorn.socket` `sudo systemctl enable gunicorn.socket`
4. Check `curl --unix-socket /run/gunicorn.sock localhost` if error occurred run `journalctl -u gunicorn` to see logs
5. Inatall nginx `apt install -y nginx` 
6. Create file `sudo nano /etc/nginx/sites-available/algo` and put:
```
server {
  root /home/AlgoDev/frontend/build/;
  index index.html;
  server_name 194.163.164.243;
  location / {
    try_files $uri /index.html;
  }
}
```
7. Enable config `sudo ln -s /etc/nginx/sites-available/algo /etc/nginx/sites-enabled` 
8. Check `sudo nginx -t` 
9. Restart `sudo systemctl restart nginx`


## Setup Frontend
1. Install nodejs 
```bash
sudo curl -sL https://deb.nodesource.com/setup_12.x | sudo bash -
sudo apt-get install -y nodejs
``` 
2. Install yarn
```bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```
3. Add `.env` file with `REACT_APP_BASE_URL="https://botcommerce.io"` text.
4. Build `yarn build`

## Install ssl
1. Install certbot `sudo apt-get install certbot python3-certbot-nginx`
2. Let certbot setup nginx `sudo certbot --nginx`


## Backup database
1. Install yandex-disk utils add `export LC_ALL=C; unset LANGUAGE` to `.profile` and run:
```
wget http://repo.yandex.ru/yandex-disk/yandex-disk_latest_amd64.deb
dpkg -i yandex-disk_latest_amd64.deb
``` 
2. Setup yandex disk `yandex-disk setup`
3. Create backup script `nano dumper.sh` and put:
```
#!/bin/bash
PGPASSWORD="{password}" pg_dump -h localhost -p 5432 -U {username} botcommerce > ~/backups/botcommerce_$(date +"%Y-%m-%d_%I:%M:%p").backup
```
3. Add execute access `chmod +x dumper.sh`
4. Setup crontab `crontab -e` add `0 0 * * * /root/dumper.sh` it will run dumper script everyday at midnight
5. Do not forget to run ./dumper.sh before every deploy

---

### Useful commands and snippents
* `journalctl -u gunicorn` - see gunicorn logs
* `systemctl restart nginx` - restart nginx
* `systemctl restart gunicorn` - restart gunicorn
* `nano /etc/nginx/sites-available/botcommerce` - change nginx settings
* `nginx -t` - check nginx config files


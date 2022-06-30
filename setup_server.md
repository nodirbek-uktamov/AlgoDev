# Server setup

## Setup server (Ubuntu 20)

### Install git and clone repository

1. Install git `sudo apt update` `sudo apt install -y git` and check `git --version`
2. Generate deploy key `ssh-keygen -o -t rsa -b 4096 -C "hftterminal"`
3. Go to Settings > Deploy keys, add new deploy key. `cat .ssh/id_rsa.pub`
4. `cd ../home` And Clone repository

### Install PostgreSQL and Setup

1. Install `sudo apt install -y postgresql-11` (run it if needed `sudo systemctl start postgresql@11-main`)
2. Change user `sudo su - postgres`
3. Create new user `createuser --interactive --pwprompt`
4. Create database `createdb -O username terminal`
5. Logout from postgres role `exit`

(you can login into database using `psql -U username -d terminal -h localhost`)

### Setup python and run application

1. Install python `sudo apt install python3.9`
2. Install pip3 `apt install -y python3-pip`
2.0 Check is python and pip installed:    
```
python3 --version
pip3 --version   
```
3. Make python3 default add  `alias python="python3"` and `alias pip="pip3"` to ~/.bashrc
4. Go to backend `cd /home/terminal/backend`
5. Install dependencies `pip install -r requirements.txt`
6. Copy settings_dev.py.example as settings_dev.py and change it as you need
7. Add `export DJANGO_SETTINGS_MODULE=config.settings_prod` to ~/.bashrc file
8. Collect statics `python manage.py collectstatic --no-input`
9. Migrate changes `python manage.py migrate`
10. Generate key for decoding and encoding secret keys of users:
   ```
   python manage.py generate_decode_key   
   ```
11. Save decode key in settings_dev:
   ```
   DECODE_KEY = 'SOME_LARGE_KEY_FROM_COMMAND'
   ```

   key must be like this (don't use this one): `sw877-QPAnKqNmY9UZKP9yVZwF8uV184qPllZ_Om6QM=`

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

2. Open `nano /etc/systemd/system/logs.service` and put
    
    ```
    [Unit]
    Description=gunicorn daemon
    Requires=gunicorn.socket
    After=network.target
    
    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/home/terminal/backend
    ExecStart=daphne config.asgi:application
    
    [Install]
    WantedBy=multi-user.target
    ```

2.1. Open `cat /etc/systemd/system/gunicorn.service` and put

    [Unit]
    Description=gunicorn daemon
    Requires=gunicorn.socket
    After=network.target
    
    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/home/terminal/backend
    ExecStart=gunicorn --env DJANGO_SETTINGS_MODULE=config.settings --access-logfile - --workers 3 --bind unix:/run/gunicorn.sock config.wsgi:application
    
    [Install]
    WantedBy=multi-user.target

3. Run `sudo systemctl start gunicorn.socket` `sudo systemctl enable gunicorn.socket`
4. Check `curl --unix-socket /run/gunicorn.sock localhost` if error occurred run `journalctl -u gunicorn` to see logs
5. Inatall nginx `apt install -y nginx`
6. Create file `sudo nano /etc/nginx/sites-available/algo` and put:
    
    ```
    upstream channels-backend {                                                                     
        server localhost:8000;                                                                      
    }                                                                                               
                                                                                                    
    server {                                                                                        
      root /home/terminal/frontend/build/;                                                           
      index index.html;                                                                             
      server_name hftcryptobot.com;                                                                 
                                                                                                    
      location / {                                                                                  
        try_files $uri /index.html;                                                                 
      }                                                                                             
                                                                                                    
      location /api/v1/ {                                                                           
            proxy_pass http://channels-backend;                                                     
                                                                                                    
            proxy_http_version 1.1;                                                                 
            proxy_set_header Upgrade $http_upgrade;                                                 
            proxy_set_header Connection "upgrade";                                                  
                                                                                                    
            proxy_redirect off;                                                                     
            proxy_set_header Host $host;                                                            
            proxy_set_header X-Real-IP $remote_addr;                                                
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;                            
            proxy_set_header X-Forwarded-Host $server_name;                                         
        }                                                                                                                                                                                   
    }                                                                                               
    ```

7. Enable config `sudo ln -s /etc/nginx/sites-available/algo /etc/nginx/sites-enabled`
8. Check `sudo nginx -t`
9. Restart `sudo systemctl restart nginx`
   1. Setup huobi bot:
   Open `nano /etc/systemd/system/huobi_bot.service` and put

    ```
    [Unit]
    Description=bot
    After=network.target
    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/home/terminal/backend
    ExecStart=python3 manage.py huobi_bot
    
    [Install]
    WantedBy=multi-user.target
    ```
   2. Setup ftx bot:
   Open `nano /etc/systemd/system/ftx_bot.service` and put

    ```
    [Unit]
    Description=bot
    After=network.target
    [Service]
    User=root
    Group=www-data
    WorkingDirectory=/home/terminal/backend
    ExecStart=python3 manage.py ftx_bot
    
    [Install]
    WantedBy=multi-user.target
    ```
11. Start/Restart bot: `sudo systemctl restart huobi_bot && sudo systemctl restart ftx_bot`
12. Setup redis for logs:   
Install docker
    ```
    docker run --name my-redis -p 6379:6379 -d redis
    pip install celery "celery[redis]"
    ```

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

### Useful commands and snippents

* `journalctl --unit=gunicorn.service -n 100 --no-pager` - see gunicorn logs
* `systemctl restart nginx` - restart nginx
* `systemctl restart gunicorn` - restart gunicorn
* `nano /etc/nginx/sites-available/botcommerce` - change nginx settings
* `nginx -t` - check nginx config files



# Restarting server:
1. Open project folder
2. run: `bash restart.bash`

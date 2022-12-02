# 2420_assign2

# ***LOAD BALANCER IP: `164.90.246.217`***

Guide to Creating Node Balancer infrastructure with Digital Ocean

## Table Contents
  * [Description](#description)
  * [Getting Started](#getting-started)
    + [Dependencies](#dependencies)
    + [Step One - DO Infrastructure set up](#step-one---do-infrastructure-set-up)
    + [Step Two - Creating Regular Users on Droplets](#step-two---creating-regular-users-on-droplets)
    + [Step Three - Installing Caddy](#step-three---installing-caddy)
    + [Step Four - Write Your Web App](#step-four---write-your-web-app)
    + [Step Five - Caddyfile](#step-five---caddyfile)
    + [Step Six - Installing Node and Npm with Volta](#step-six---installing-node-and-npm-with-volta)
    + [Step Seven - Node App Service File](#step-seven---node-app-service-file)
    + [OPTIONAL STEP - Caddy service file](#optional-step---caddy-service-file)
    + [Step Eight - Test Your Load Balancer](#step-eight---test-your-load-balancer)
  * [Author](#author)

## Description

This is a step by step guide on how to create a Node Balancer that will forward http request to two different droplets. These droplets will respond with a static *index.html* file or a node app running locally. This node application will be running on *localhost:5050* and will respond to the */api* request

## Getting Started

### Dependencies

* Load Balancer and two Droplets follow video instructions : <a href="https://vimeo.com/775412708/4a219b37e7" target="_blank">DO Setup</a>
* File editor such as Vim or Nano to edit files
* WSL and DigitalOcean droplets
* Ubuntu 22.10 or 22.04
* Windows/MacOS Terminal
* Volta to install node
* Fastify for your NodeJS server

### Step One - DO Infrastructure set up

You should follow <a href="https://vimeo.com/775412708/4a219b37e7" target="_blank">this</a> video to get started. After finishing the setup, you should have:
* VPC
* 2 Droplets (Server 1 & Server 2)
* Load Balancer
* Firewall 

**VPC**

<img width="600" alt="vpc" src="https://user-images.githubusercontent.com/100272904/205219230-2981c50a-9178-42d6-8912-ebaca537343f.png">

**Load Balancer & Servers**

<img width="600" alt="loadbalancer" src="https://user-images.githubusercontent.com/100272904/205219306-35138f97-897c-411d-b5e0-3255fd0b7ae3.png">

**Firewall**

<img width="600" alt="fw" src="https://user-images.githubusercontent.com/100272904/205219367-c8bd27f1-a16f-4ec6-bdde-30f9b68e71cc.png">


### Step Two - Creating Regular Users on Droplets

> You will have to perform these steps on both droplets you created

* From your terminal/WSL *ssh* into your droplet by running this command: ```ssh -i /path/to/private/ssh-key root@droplet-ip```
* Create a new user with the following command ```useradd -s /usr/bin/bash -m <username>```
  * For simplicity name these users `server1`
  * This command creates a new user with a home directory and *bash* shell
* Give the new user a password with ```passwd <username>```
* Give the user *sudo* privilages with ```usermod -aG sudo <username>```

<img width="427" alt="useradd" src="https://user-images.githubusercontent.com/100272904/205224830-618d8a76-9214-4a49-83f7-958c0fcc2dc6.png">


You can now switch to this user with ```su <username>```

To add the public ssh key from your root user to your new user do the following steps:
 * Inside your new users home directory ```mkdir .ssh```
 * Switch to your root user and copy the *authorized_keys* file to the new users .ssh with ```cp ~/.ssh/authorized_keys /home/<username>/.ssh/```

### Step Three - Installing Caddy

> You will have to perform these steps on both new users you created

We will be installing the webserver <a href="https://caddyserver.com/" target="_blank">Caddy</a> in order to handle the http requests from the Load Balancer and serve content to the web

* Install Caddy with: ```wget https://github.com/caddyserver/caddy/releases/download/v2.6.2/caddy_2.6.2_linux_amd64.tar.gz```
* Unzip the tar file with: ```tar xvf caddy_2.6.2_linux_amd64.tar.gz```
* You should now have 3 new files *LICENSE* *README.md* *caddy*
* Change the *caddy* files owner and group to root with ```sudo chown root: caddy```
* Copy cady to the *bin* directory with ```sudo cp caddy /usr/bin/```

<img width="600" alt="tarcaddy" src="https://user-images.githubusercontent.com/100272904/205227897-3cdd3d4c-e828-4d30-9137-78e5d9806a7c.png">

### Step Four - Write Your Web App

These steps should be performed on your local host / WSL. The following Web App files can be downloaded from this github, or by following along with these instructions

* Create a new directory on your local machine (name it as you please)
* In this new directory create 2 new directories: *src* & *html* 
* Inside the *html* directory, create an *index.html* file with appropriate html content

Here is a template for *index.html*:

```
<!DOCTYPE html>
<html lang="en">
<html>
    <head>
				<meta charset="UTF-8" />
        <title>Template/title>
    </head>
    <body>
        <h1>Template index.html</h1>
    </body>
</html>
```

* Inside *src* directory, create a new node project, you will need to install volta to do so

Here are the steps to installing volta, and installing node and fastify. Follow these commands step by step. Run these in your *src* directory
> NOTE FOR NATHAN: I've already installed volta on my mac, so I have skipped images for these steps...

```
 curl https://get.volta.sh | bash
```
```
 source ~/.bashrc
```
```
 volta install node
```
```
 npm init
```
```
 npm install fastify
```

***--Desired Outputs--***

**Volta**

<img width="600" alt="volta" src="https://user-images.githubusercontent.com/100272904/205234026-20501e9c-d944-4fbe-9627-ed0d074a85b8.png">

**init**

<img width="600" alt="init" src="https://user-images.githubusercontent.com/100272904/205234102-f71dd3cf-fedf-4b8b-b337-4767c3eb56f6.png">

**fastify**

<img width="509" alt="fastify" src="https://user-images.githubusercontent.com/100272904/205234159-c4f1ba95-9c3b-4add-add2-cf424d1a689f.png">

* Inside *src* create an *index.js* file

Add the following code inside this *index.js*:

```
// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })

// Declare a route
fastify.get('/api', async (request, reply) => {
  return { hello: 'Server 1' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 5050 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
```

* Test your index.js file by running ```node index.js``` in the command line and visiting your *localhost:5050/api* on the web browser

<img width="600" alt="nodeindex" src="https://user-images.githubusercontent.com/100272904/205236122-5651ea85-a722-408e-9430-dfd943435c97.png">

<img width="279" alt="browserpic" src="https://user-images.githubusercontent.com/100272904/205236427-b9d79ec4-d65d-497f-a66a-169c45f30cc5.png">

If there are no errors, you should see { hello: 'Server 1' }

* You will want to transfer this directory created in *Step Four* to both of your DO droplets
* To do so, run:

```
rsync -r <directory-name> "server1@<droplet-ip>:~/" -e "ssh -i /path/to/ssh-key -o StrictHostKeyChecking=no"
```
> Run this command for both droplets

Succesful output:

<img width="600" alt="rsync" src="https://user-images.githubusercontent.com/100272904/205239963-a5c36d06-6428-4374-ae68-e7a3ed7c25af.png">

<img width="460" alt="ssh work" src="https://user-images.githubusercontent.com/100272904/205240002-84fe1ecd-5aa3-40fe-9403-f1f7c468ef3a.png">

* On both droplets create a *www* folder in your */var*: ```sudo mkdir /var/www```
* Move your your *src* and *html* folders from the folder you just transfered to the *www* directory

```
sudo mv ~/2420-assign-two/html/index.html /var/www/
sudo mv ~/2420-assign-two/src /var/www/
```

This is what your file structure should look like now for *var/www/*:

<img width="447" alt="filestructure" src="https://user-images.githubusercontent.com/100272904/205253582-c779bb1c-2a4c-4426-84fc-ca87a93efaa5.png">


> Note: You will want to change some of the HTML and the *{hello: 'Server 1'}* content from the *index.js* for one of the droplets so you can differentiate them

### Step Five - Caddyfile

Again on your local machine, you will want to write a Caddyfile, which will be your configuration file for *caddy*

* Inside the directory created in *Step Four* create a file called *Caddyfile* with the following content inside:

```
http:// {
    root * /var/www/html
    reverse_proxy /api localhost:5050
    file_server
}
```

* If the file works, you should be able to see your *index.js* {hello : 'Server1} message
* To see if it works, transfer the *Caddyfile* to both your droplets using: 
```
rsync -r <directory-name> "server1@<droplet-ip>:~/" -e "ssh -i /path/to/ssh-key -o StrictHostKeyChecking=no"
```
* Again, in both droplets, create a directory to store this file: ```sudo mkdir /etc/caddy```
* Move the file to the directory: ```sudo mv caddy /etc/caddy/```

<img width="393" alt="Caddyfilemv" src="https://user-images.githubusercontent.com/100272904/205245399-da104806-7884-49dd-bf22-2b0e00610a11.png">

### Step Six - Installing Node and Npm with Volta
> Perform these steps on both droplets

As done priviously in *step four* we will need to install *Volta* in order to install *node* and *npm* on the droplets

To do so follow the same commands:

```
 curl https://get.volta.sh | bash
```
```
 source ~/.bashrc
```
```
 volta install node
```
```
 npm install fastify
```

Succesful output:

<img width="600" alt="stepsix" src="https://user-images.githubusercontent.com/100272904/205246964-11fa9e28-b074-4aad-8b33-2b53069b9315.png">

This will allow us to execute the *index.js* file

### Step Seven - Node App Service File
> Perform these steps on both droplets

The node service file will fulfill the following requirements:

 * Restart the service on failure
 * Require a configured network
 * Run the *index.js* app

For this example, we will be creating this service file with the name *hello_web.service*

* On your local machine create file called *hello_web.service* and add the following content:

```
[Unit]
Description=run node app on localhost:5050
After=network.target

[Service]
Type=simple
User=server1
Group=server1
ExecStart=/home/server1/.volta/bin/node /var/www/src/index.js
Restart=on-failure
RestartSec=5
SyslogIdentifier=hello_web

[Install]
WantedBy=multi-user.target
```
* As shown in previous steps, copy this file to both your droplets
* Within your droplets move this file to the */etc/systemd/system/* directory: ```sudo mv hello_web.service /etc/systemd/system```

<img width="523" alt="helloweb" src="https://user-images.githubusercontent.com/100272904/205249900-22615318-68f3-4dac-b2ce-b30cbf9b6a6c.png">

To test the service, run the following commands:

```
sudo systemctl daemon-reload
sudo systemctl enable hello_web.service
sudo systemctl restart hello_web.service
systemctl status hello_web.service
```

Succesfull status output:

<img width="600" alt="statushello_web" src="https://user-images.githubusercontent.com/100272904/205254764-e352d8e6-a301-4789-919b-7b6867e924ba.png">

### OPTIONAL STEP - Caddy service file

This step is optional but useful. 

* Make a service file, call it *caddy.service*
* Add the following content to it:
```
[Unit]
Description=Serve HTML in /var/www/html using caddy
After=network.target

[Service]
Type=notify
ExecStart=/usr/bin/caddy run --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile
TimeoutStopSec=5
KillMode=mixed

[Install]
WantedBy=multi-user.target
```

* Same as for *step seven* put this file in your droplets */etc/systemd/system/* directory

To test the service, run the following commands:

```
sudo systemctl daemon-reload
sudo systemctl enable caddy.service
sudo systemctl restart caddy.service
systemctl status caddy.service
```

Succesfull status output:

<img width="600" alt="caddyservstatus" src="https://user-images.githubusercontent.com/100272904/205256174-35d304c6-52b4-4193-ab79-aaf1dc4df933.png">

### Step Eight - Test Your Load Balancer

At this point you have already uploaded your service files and *Caddyfile* to both your droplets. You should also have 2 different *index.html* files inside your droplets */var/www/html* and *index.js* files in your droplets */var/www/src*. If all your services are running you should be able to access your *Load Balancer's* IP address and see the HTML content from both droplets, you should also be able to see the node app of both droplets by visiting your *Load Balancer's* API route.

*** Proof Load Balancer Working ***

<img width="600" alt="worked1" src="https://user-images.githubusercontent.com/100272904/205258263-2d670e91-5bb0-4f3d-87b3-1ff3c9b6d4af.png">

<img width="600" alt="worked2" src="https://user-images.githubusercontent.com/100272904/205258289-29bb77b0-1912-498c-ad06-372d1e88791b.png">

<img width="600" alt="worked3" src="https://user-images.githubusercontent.com/100272904/205258321-eec9b06d-0ec6-452c-b909-943d28e976d2.png">

<img width="600" alt="worked4" src="https://user-images.githubusercontent.com/100272904/205258343-10aece81-d366-40ed-a331-13e9ec88ea55.png">

```
http://164.90.246.217
http://164.90.246.217/api
```

### Author

Tristan Davis 

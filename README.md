# 2420_assign2

# ***LOAD BALANCER IP: `164.90.246.217`***

Guide to Creating Node Balancer infrastructure with Digital Ocean

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

### Step Five - Caddyfile

Again on your local machine, you will want to write a Caddyfile, which will be your configuration file for *caddy*

Succesfull output:

<img width="600" alt="rsync" src="https://user-images.githubusercontent.com/100272904/205239963-a5c36d06-6428-4374-ae68-e7a3ed7c25af.png">

<img width="460" alt="ssh work" src="https://user-images.githubusercontent.com/100272904/205240002-84fe1ecd-5aa3-40fe-9403-f1f7c468ef3a.png">


### Author

Tristan Davis

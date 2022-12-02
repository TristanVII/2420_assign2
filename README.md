# 2420_assign2

# ***LOAD BALANCER IP: `164.90.246.217`***

Guide to Creating Node Balancer infrastructure with Digital Ocean

## Description

This is a step by step guide on how to create a Node Balancer that will forward http request to two different droplets. These droplets will respond with a static *index.html* file or a node app running locally

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
*The following steps must be performed on your remote server*

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





### Author

Tristan Davis

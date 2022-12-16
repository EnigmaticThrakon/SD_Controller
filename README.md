# SD_Controller

This repository will hold the project dedicated to communicating with the intermediate server, which will allow for the server to have the device
    execute certain commands and store data passed to it from the user

To be run on Raspberry Pi or other controller to be used on device

**Connecting to Internet Through Ethernet to Another Computer**
1. Control Panel
2. Network and Internet
3. Network and Sharing Center
4. Click on the Private/Wi-Fi network
5. Properties
6. Sharing
7. Select both checkboxes
8. Select `Ethernet` from the dropdown (or whatever the wired connection is)
9. Ok

## Setting Up Environment:

------------------------
### Wi-Fi
> If `/etc/netplan/` directory doesn't exist: `sudo apt install netplan.io`

1. Change or Create YAML file in `netplan` directory:

```
network:
    version: 2
    renderer: networkd
    wifis:
        wlan0:
            dhcp4: yes
            optional: false
            dhcp6: yes
            access-points:
                "<wifi-name>":
                    password: "<password>"
    ethernets:
        eth0:
            optional: true
            dhcp4: no
            addresses: [<static_ip>/24]
            nameservers:
                addresses: [8.8.8.8]
```

*For connecting to an enterprise network*
```
network:
    version: 2
    renderer: networkd
    wifis:
        wlan0:
            dhcp4: yes
            dhcp6: yes
            access-points:
                "<wifi-name>":
                    auth:
                        key-management: eap
                        identity: "<login>"
                        password: "<password>"
```
2. `sudo netplan generate && sudo netplan try && sudo netplan apply`
3. `sudo rfkill unblock wifi`
4. `sudo ifconfig wlan0 up`
5. `sudo shutdown -r now`
--------------------

### SQLite

> `sudo apt-get install sqlite3`
--------------------

### Redis

> `sudo apt-get install redis`
--------------------

### CMake

> `sudo apt-get install cmake`
--------------------

### Node

1. `sudo apt install curl`
2. `curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash`
3. `source ~/.bashrc`
4. `nvm install node`
--------------------

### Python Modules

`pip instal ...`
* `redis`
* `pylogix`
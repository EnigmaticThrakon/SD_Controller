# SD_Controller

This repository will hold the project dedicated to communicating with the intermediate server, which will allow for the server to have the device
    execute certain commands and store data passed to it from the user

To be run on Raspberry Pi or other controller to be used on device

**Connecting to Internet Through Ethernet to Another Computer**
> Control Panel

> Network and Internet

> Network and Sharing Center

> Private Network (Click Network Name)

> Properties

> Sharing

> Enable and select Ethernet (Whichever one the device is connected to)

> Click Ok

Steps to setting up environment:

If `/etc/netplan/` directory doesn't exist: `sudo apt install netplan.io`

Change or Create YAML file in `netplan` directory:

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
                    password: "<password>"
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

`sudo netplan generate && sudo netplan try && sudo netplan apply`

`sudo rfkill unblock wifi`
`sudo ifconfig wlan0 up`

reboot
Check network connction: `ip a`

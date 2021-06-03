# virtual-button-box
This is a VJoy Client with custom layout feature

currently has button and throttle axis component.

You can place components in layout and change position and size feedly

## Installation Requirements

1. Vjoy must Installed before use virtual-button-box

2. clients(phone or tablet) need in same local network with your PC and can reach each others (default TCP port 9998), you can change port and binding in appsettings.json

## How To Use
0. [get release from here](https://github.com/hsinyu-chen/virtual-button-box/releases)

1. click Hcs.VirtualButtonBox.exe to start hosting server ( right click on tray icon to exit)，virtual-button-box need Admin privilege to communicate with Vjoy

2. open browser at pc/phone with url http://<your.pc.local.ip>:9998 (eq: http://192.168.1.123:9998)

3. tap "GEAR" icon to create / select which Vjoy device you want to use with virtual-button-box, if your Vjoy is new installed , recreate first device is recommanded

4. tap "Plus" icon to create new layout

5. tap "Edit(pencil)" icon to edit you layout, question mark for further information

## Know Issues

1. IOS device can't use fullscreen mode

![image](https://i.imgur.com/xYwJnSs.jpg)
![image](https://i.imgur.com/3UuCBTE.png)
![image](https://i.imgur.com/QKM9DRl.png)

# PFSenseAutomation

PFSenseAutomation is a TamperMonkey script to automate processes in the PFSense web interface.

# Features

* **Hotkeys** for dashboard, firewall rules and firewall logs
* **Automated certificate generation & OpenVPN config export** with common name being prompted from the user

See the script source code for more detailed documentation.

# Installation

First install [TamperMonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or the equivalent for your Browser of choice.

After that, copy `pfsense.user.js` from this repository into TamperMonkey.

The minimal configuration is to change this line:

```
// @match        https://pfsense01.mydomain.com/*
```

to the URL you use to access your PFSense instance (don't forget the `*` at the end!).

Additionally, for the more advanced automation scripts you need to configure some options

**Note that you need to reload (F5) the PFsense page every time you change the script!**

# About

PFSenseAutomation was written by [Uli Köhler](https://techoverflow.net/) in Fall 2020 when he couldn't stand the thought of manually generating & exporting about 100 VPN certificates and configurations for his OpenVPN clients.

Configurations & issues including feature suggestions are more than welcome.
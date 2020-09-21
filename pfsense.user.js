// ==UserScript==
// @name         PFSense automation script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  PFSense
// @author       Uli Köhler
// @homepage     https://github.com/ulikoehler/PFSenseAutomation
// @match        https://pfsense01.mydomain.com/*
// @grant        none
//
// PFSense automation script.
// INSTALLATION
//  First, change the @match line above to match your pfsense's domain & protocol !
//  In order to use the certificate generation, you need to configure the script. See below for instructions.
// CONFIGURATION
//  TODO
// CONTRIBUTING
//  Just submit a pull request on GitHub https://github.com/ulikoehler/PFSenseAutomation
// CONTACT
//  Via GitHub https://github.com/ulikoehler/PFSenseAutomation
//
// ACTIONS / Hotkeys
// These work out of the box IF you have configured @match correctly !
//
// ALT+R - Go to firewall rules
// ALT+L - Go to firewall logs
// ALT+D - Go to dashboard
//
// PROCESS AUTOMATIONS - These require configuration
//
// ALT-Q - Generate a new certficate (common name is prompted from the user) and export the OpenVPN client config for it
//   See altQConfiguration begl
//   You might need to further customize this command to suit your particular configuration.
//   In case you add any features, please submit a pull request if possible!
//
// ==/UserScript==

/**
 * Configuration options for VPN certificate generation & client export
 */
const altQConfiguration = {
    // NOTE: Default settings are used for everything else (especially on the VPN client export page), so be sure to configure the defaults correctly
    keyLength: 4096, // Length of the generated RSA key
    digestAlg: "sha512", // Hash algorithm for the certificate
    caName: "PLEASE INSERT YOUR CA NAME HERE", // The certification authority name to generate the certificate for
}

$(document).ready(function() {
    'use strict';

    console.info("PFSense automation active!");

    const continuationKey = "_pfsense_automation_continuation"; // This sessionstorage key
    // Check continuation
    const continuationActions = {
        "generateCert": continueGenerateCert,
        "goToOpenVPNExportPage": continueGoToOpenVPNExportPage,
        "exportOpenVPNConfig": continueExportOpenVPNConfig
    };
    const _continuation = sessionStorage.getItem(continuationKey);
    if(_continuation) {
        sessionStorage.removeItem(continuationKey);
        const action = continuationActions[_continuation]
        if(action) {action();}
    }

    /**
     * Alt+Q: Generate certificate and export OpenVPN config for it
     */
    function onAltQ() {
        console.log("Alt+Q pressed");
        sessionStorage.setItem(continuationKey, "generateCert");
        window.location.href = window.location.origin + "/system_certmanager.php?act=new";
    }

    /**
     * Alt+L: Go to system log page
     */
    function onAltL() {
        console.log("Alt+L pressed");
        window.location.href = window.location.origin + "/status_logs_filter.php";
    }

    /**
     * Alt+R: Go to firewall rules
     */
    function onAltR() {
        window.location.href = window.location.origin + "/firewall_rules.php";
    }

    /**
     * Alt+D: Go to dashboard
     */
    function onAltF() {
        window.location.href = window.location.origin + "/";
    }

    function continueGenerateCert() {
        let cn = window.prompt("Client name");
        if(cn === null) {
            console.info("User aborted the certificate generation");
        }
        // General config
        $("#keylen").val(altQConfiguration.keyLength).trigger("change");
        $("#digest_alg").val(altQConfiguration.digestAlg).trigger("change");
        $("#dn_commonname").val(cn).trigger("change");
        $("#descr").val(cn).trigger("change");
        // Find the correct CA
        let caId = null;
        for(let option of document.querySelectorAll("#caref option")) {
           if(option.textContent == "vpn.techoverflow.net CA") {
               caId = option.getAttribute("value");
               break;
           }
        }
        if(caId === null) {
            alert("Didn't find CA ${altQConfiguration.caName}. Please check altQConfiguration");
            return;
        }
        $("#caref").val(caId).trigger("change"); //"vpn.techoverflow.net CA". NOTE: Inspect the HTML of the CA element to see the available options
        // Store the common name so that we know what to export
        window.sessionStorage.setItem("_cert_export_cn", cn);
        // Save after short timeout to give the page time to process
        window.sessionStorage.setItem(continuationKey, "goToOpenVPNExportPage");
        setTimeout(() => {$("#save").click()}, 50);
    }

    function continueGoToOpenVPNExportPage() {
        sessionStorage.setItem(continuationKey, "exportOpenVPNConfig");
        window.location.href = window.location.origin + "/vpn_openvpn_export.php";
    }

    function continueExportOpenVPNConfig() {
        const cn = window.sessionStorage.getItem("_cert_export_cn");
        // Iterate the table with all the client entries
        const usersTable = $("#users > tbody");
        $("tr", usersTable).each(function() {
            const tds = $("td", this).toArray();
            const name = tds[1].textContent;
            if(name == cn) {
                console.log("Found the correct certificate on the client export page!");
                // This is the client line we're looking for => Download !
                const inlineExportButton = $("a:first", tds[2]).toArray()[0];
                inlineExportButton.click();
            }
        });
    }

    function onKeydown(evt) {
        // Use https://keycode.info/ to get keys
        if (evt.altKey && evt.keyCode == 81) {
            onAltQ();
        } else if (evt.altKey && evt.keyCode == 76) {
            onAltL();
        } else if (evt.altKey && evt.keyCode == 70) {
            onAltF();
        } else if (evt.altKey && evt.keyCode == 82) {
            onAltR();
        }
    }
    document.addEventListener('keydown', onKeydown, true);
});
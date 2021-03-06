
/* Required Imports */
const St = imports.gi.St; // For creating UI elements
const Main = imports.ui.main; // Main UI instance class 
const GLib = imports.gi.GLib; // Required for executing shell commands
const Mainloop = imports.mainloop; // Timer/Scheduler. 
const ByteArray = imports.byteArray; // Parser for returned shell outputs


/* Global variables for use as the panel icon and as the loop timeout. */
let panelIcon, timeout;

function _queryRam() {
    // Querys the RAM using the Linux `free` command. Output is `grep`ped and `awk`ed
    let [ok, out, err, exit] = GLib.spawn_command_line_sync('/bin/bash -c "free -m | grep Mem | awk \'{print (($2 - $7)/$2)*100}\'"');
    let ram = `${parseFloat(ByteArray.toString(out)).toFixed(1).toString()}%`; // Parse as 1-decimal percentage
    return ram;
}

function _updateUI () {
    // Updates the icon in the panel with the new value of the RAM percentage
    let nRam = _queryRam();
    let label = new St.Label({ text: nRam });
    panelIcon.set_child(label);
}

function _stopTimer() {
    // Stop the scheduler once the extension is disabled/killed/restarted
    if (timeout) {
        Mainloop.source_remove(timeout);
        timeout = null; 
    }
}
function _refresh() {
    // Main scheduler
    _stopTimer()
    _updateUI();
    timeout = Mainloop.timeout_add_seconds(2, _refresh);
}


function init() {
    panelIcon = new St.Bin({ style_class: 'panel-button',
                          reactive: false,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });

    let label = new St.Label({ text: "..." }); // Simulate RAM query
    panelIcon.set_child(label); // Add text to icon
    log("Finished Initialization");
}

function enable() {
    // Position the icon. This will eventually be customizable
    log("Enabled...");
    Main.panel._rightBox.insert_child_at_index(panelIcon, 2);
    log("Started monitoring RAM...");
    _refresh(); // Start scheduler
}

function disable() {
    // Cleanup
    log("Disabled...");
   _stopTimer();
    Main.panel._rightBox.remove_child(panelIcon);
    log("End...")
}

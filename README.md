# Sensor Watch Prototyper

## Clever features

+ Import / export of sequence data to share designs
+ Continuous auto-save in case of accidental page reload
+ Keyboard shortcuts for watch buttons (q=light, a=mode, s=alarm)
+ Full undo/redo history, access via icons of Ctrl+Z, Ctrl+Y

## Coming soon

+ WebBluetooth integration with watch hardware itself

### WIP notes from George:

BUGS:

+ ~Duplicate sequences IDs are possible: fix this and fix sequence duplication. Sort all index number references~
+ ~Step splicing does not work in the correct place~
+ Add leading dot to segment_0

TODO:

+ ~Create a common styling for buttons and colours across all CSS~
+ ~Fix Sequence index saving and restorting (to enable duplicate & delete buttons to work)~
+ ~Code re-factor to reduce duplication (and clean up this.elm, this.opts_elm etc...)~
+ ~Rename to sensor-watch-prototyper~
+ Document all features, especially helper UI features (like hold down to drag through segments)
+ Tidy up ordering and naming of LEDs

TODO Features:

+ ~Connect button for Bluetooth comms~
+ ~Warning for not having web bluetooth in browser~
+ Help?
+ Settings (toggles for segment coupling restriction and LED colours)
+ Drag-drop re-ordering of steps
+ ~Make button actions work~
+ ~Make clicking on 3x buttons on UI work~
+ ~Add sequence names to dropdowns for button actions~
+ ~Save button actions to state each time~
+ ~Add versioning to designer to save in import/export files~
+ Add "clear localstorage" option in settings
+ ~Make UI a bit less chaotic with the menus?~
+ Add scroll wheel on duration boxes to count up/down in 50ms increments
+ ~Add highlighting for currently playing step and sequence in greenyellow?~  
+ ~Ctrl+Z, Ctrl+Y for undo/redo~
+ ~Ensure sequences have unique names~
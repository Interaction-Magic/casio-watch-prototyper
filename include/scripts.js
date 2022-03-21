'use strict';

// When page loads
document.addEventListener("DOMContentLoaded", () => {

	// Copy over the segments array to a couple of places (to avoid having too heavy an HTML on load)
	const segments_source = document.querySelector(".segment_components").innerHTML;
	const copy_watch_display = (destination) => {
		destination.innerHTML = destination.innerHTML + segments_source;
	};
	copy_watch_display(document.querySelector(".live_watch"));
	copy_watch_display(document.querySelector(".segments"));

	// Create new Bluetooth connection
	const BT = new BTConnector({
		namePrefix: "SensorWatch",  // Filter for devices with this name
		onReceive: (msg) => {
			switch(msg.substring(0,1)){
				case 'b':
					handle_hw_button_press(msg.substring(1,2), msg.substring(2,3));
					break;
			}
		},
		onDisconnect: () => {
			console.log(`BT disconnected!`);
			document.querySelector('.connect').classList.remove('is-connected');
			document.querySelector('.connect').title = "";
		},
		onStatusChange: (msg) => {
			console.log(`BT status: ${msg}`);
		},
		onBatteryChange: (msg) => {
			console.log(`BT battery: ${msg}`);
		}, 
	 });

	// Create a new instance of the Designer 
	const designer = new Designer({
		dom: 				document.querySelector(".sequences"), 
		live_watch: 	document.querySelector(".live_output"),
		data: 			sample_sequence,
		bt_write: 		(bytes) => {
			BT.sendBytes(bytes);
		}
	});

	 
	const connect_btn = document.querySelector('.connect');
	connect_btn.addEventListener('click', async (e) => {
		e.preventDefault();

		if (!navigator.bluetooth) {
			document.querySelector('.api_warning').textContent = 'WebBluetooth API is not available. Try using Chrome or Edge';
			document.querySelector('.api_warning').style.display = 'block';
			return;
		}

		connect_btn.classList.add('is-connecting');
		const ble_device = await BT.connect();
		if(ble_device){
			console.log(`BT connected!`);
			connect_btn.classList.remove('is-connecting');
			connect_btn.classList.add('is-connected');
			connect_btn.title = ble_device;
		}else{
			connect_btn.classList.remove('is-connecting');
		}
	});
	
	// Create three buttons
	const light = new Input({
		name: "light",
		key: "q",
		has_double_press: false,
		dom: document.querySelector(`.watch_button_light`),
		fire: (press) => designer.handle_input("light", press)
	});
	const mode = new Input({
		name: "mode",
		key: "a",
		has_double_press: false,
		dom: document.querySelector(`.watch_button_mode`),
		fire: (press) => designer.handle_input("mode", press)
	});
	const alarm = new Input({
		name: "alarm",
		key: "s",
		has_double_press: false,
		dom: document.querySelector(`.watch_button_alarm`),
		fire: (press) => designer.handle_input("alarm", press) 
	});

	// Deal with an incoming switch message from the HW watch
	const handle_hw_button_press = (button, type) => {
		switch(button){
			case 'A':
				(type == 'p') ? alarm.down() : alarm.up();
				break;
			case 'L':
				(type == 'p') ? light.down() : light.up();
				break;
			case 'M':
				(type == 'p') ? mode.down() : mode.up();
				break;
		}
	}

	// Add click handlers to menu buttons
	document.querySelectorAll("nav a, .checkbox").forEach((link) => {
		link.addEventListener("click", (e) => {
			e.preventDefault();

			// Get the hash, to work out what sort of switch it is
			const url_target = link.href;
			if(!url_target){
				return;
			}
			const hash = url_target.substring(url_target.indexOf('#') + 1);

			if(link.classList.contains('checkbox')){
				link.classList.toggle('is-checked');
			}

			switch(hash){

				case "play":
					designer.play_pause();
					break;
				
				case "undo":
					designer.history_undo();
					break;
				
				case "undoundo":
					designer.history_undoundo();
					break;

				case "add_sequence":
					designer.sequence_add();
					designer.history_save();
					break;

				case "import":
					upload_file();
					break;

				case "export":
					download_file();
					break;

				case "settings":
					document.querySelector('.settings_panel').classList.toggle('hide_settings');
					break;

				case "reset_all":
					designer.history_reset();
					location.reload();
					break;

				case "couple_segments":
					set_segment_coupling(document.querySelector('.toggle_couple_segments').classList.contains('is-checked'));
					save_preferences();
					break;

				case "red_blue_leds":
					set_red_blue(document.querySelector('.toggle_red_blue_leds').classList.contains('is-checked'));
					save_preferences();
					break;
					
			}
			
			link.blur();
		});
	});

	// Deal with [ersonal interface preferences
	// These are cosmetic things only
	const save_preferences = () => {
		const preferences = {
			couple_segments: document.querySelector('.toggle_couple_segments').classList.contains('is-checked'),
			red_blue_leds: document.querySelector('.toggle_red_blue_leds').classList.contains('is-checked')
		}

		localStorage.setItem('preferences', JSON.stringify(preferences));
	}
	const load_preferences = () => {
		const preferences = JSON.parse(localStorage.getItem('preferences'));

		if(localStorage.getItem('preferences')){
			// Apply settings
			set_red_blue(preferences.red_blue_leds);
			set_segment_coupling(preferences.couple_segments);

		}else{
			// Defaults here
			console.log("Loading default preferences");
			set_segment_coupling(true);
			set_red_blue(true);
		}
	}

	const set_red_blue = (is_red_blue) => {
		document.querySelector('.toggle_red_blue_leds').classList.toggle('is-checked', is_red_blue);

		document.body.classList.toggle('red_blue_leds', is_red_blue);
		document.querySelector('.led_0 rect').style.fill = is_red_blue ? "url(#gradient_light_blue)" : "url(#gradient_light_green)";
	}
	const set_segment_coupling = (is_segment_coupling) => {
		document.querySelector('.toggle_couple_segments').classList.toggle('is-checked', is_segment_coupling);

	}

	// Load them on page load
	load_preferences();

	// Receive input file from upload
	const upload_file = () => {
		const helper_link = document.createElement('input');
		helper_link.type = "file";
		helper_link.accept = "text/plain";
		helper_link.addEventListener("change", (e) => {

			if(e.target.files[0]){
				console.log(e.target.files[0]);
				let reader = new FileReader();
				reader.readAsText(e.target.files[0]);

				reader.onload = function() {
					designer.load_in_data(JSON.parse(reader.result));
					alert(`Imported: ${e.target.files[0].name}`);
					designer.history_save();
				};
				
				reader.onerror = function() {
					alert("Error importing file");
				};
			}


		});
		helper_link.click();
	}
	
	// Generate downloadable text file of data
	const download_file = () => {

		let data = JSON.stringify(designer.get_data());
	
		// Trigger download
		const helper_link = document.createElement('a');
		helper_link.href = `data:text/plain;charset=utf-8,${encodeURI(data)}`;
		helper_link.target = '_blank';
		helper_link.download = `sensor_watch_ui_${Math.round(Date.now()/1000)}.txt`;
		helper_link.click();
	}
	
});


const sample_sequence = {"version":"0.1","start_time":1647898643678,"current_sequence_index":0,"sequences":[{"name":"Example","index":0,"order":0,"triggers":{"mode":-1,"light":-1,"alarm":-1},"steps":[{"index":10,"order":0,"segments":[{"type":"digit","digit":"digit_0","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false,"segment_H":false,"segment_I":false}},{"type":"digit","digit":"digit_1","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false,"segment_dot":false}},{"type":"digit","digit":"digit_2","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_G":false}},{"type":"digit","digit":"digit_3","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_4","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_5","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_6","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_7","data":{"segment_A":false,"segment_B":true,"segment_C":true,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_8","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_9","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"special","data":{"colon":false,"signal":false,"bell":false,"pm":false,"hr":false,"lap":false}}],"hardware":{"led_0":false,"led_1":false,"buzzer":0},"duration":500},{"index":11,"order":1,"segments":[{"type":"digit","digit":"digit_0","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false,"segment_H":false,"segment_I":false}},{"type":"digit","digit":"digit_1","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false,"segment_dot":false}},{"type":"digit","digit":"digit_2","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_G":false}},{"type":"digit","digit":"digit_3","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_4","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_5","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_6","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_7","data":{"segment_A":true,"segment_B":true,"segment_C":false,"segment_D":true,"segment_E":true,"segment_F":false,"segment_G":true}},{"type":"digit","digit":"digit_8","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"digit","digit":"digit_9","data":{"segment_A":false,"segment_B":false,"segment_C":false,"segment_D":false,"segment_E":false,"segment_F":false,"segment_G":false}},{"type":"special","data":{"colon":false,"signal":false,"bell":false,"pm":false,"hr":false,"lap":false}}],"hardware":{"led_0":false,"led_1":false,"buzzer":0},"duration":500}]}]};
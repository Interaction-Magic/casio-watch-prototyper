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
	
	// Create a new Designer
	const designer = new Designer({
		live_watch : document.querySelector(".live_watch")
	});

	document.querySelector(".run").addEventListener("click", (e) => {
		e.preventDefault();
		designer.play_pause();
	});









/*	// Create Logger object
	const logger = new Logger({
		container: document.querySelector(".log-container"),
		char: ''
	});
	logger.log("Simulator started");


	// Create Bike instance
	const bike = new Bike({
		logger: logger
	});


	// Toggles for interface settings
	document.querySelector(".connect").addEventListener("click", async (e) => {
		e.preventDefault();
		let connected = await serial.connect();
		if(connected){
			e.target.classList.add("connected");
			logger.log("💡 Connected to prototype");
		}else{
			logger.log("⚠️ Could not connect");
		}
		e.target.blur();
	});	
	document.querySelector(".invert_mode").addEventListener("click", (e) => {
		e.preventDefault();
		bike.swap_mode_buttons();
		render_bike();
		e.target.blur();
	});	
	document.querySelector(".toggle_assist_plus_is_next_mode").addEventListener("click", (e) => {
		e.preventDefault();
		bike.toggle_assist_plus_is_next_mode();
		render_bike();
		e.target.blur();
	});	
	document.querySelector(".toggle_log").addEventListener("click", (e) => {
		e.preventDefault();
		document.querySelector(".log-container").classList.toggle("hide-log");
		e.target.blur();
	});		
	document.querySelector(".toggle_notes").addEventListener("click", (e) => {
		e.preventDefault();
		document.querySelector(".notes").classList.toggle("hide-notes");
		e.target.blur();
	});	

	document.addEventListener('keydown', (e) => {
		switch(e.code){
			case "ArrowUp":
				bike.trigger_plus();
				break;
			case "ArrowDown":
				bike.trigger_minus();
				break;
			case "Space":
				bike.start_assist_plus();
				break;
		}
		render_bike();
	});
	document.addEventListener('keyup', (e) => {
		switch(e.code){
			case "Space":
				bike.stop_assist_plus();
				break;
		}
		render_bike();
	});
	
	// Bike rendering things
	function render_bike(){

		const mode_number = bike.get_mode();
		const assist_plus = bike.get_assist_plus();

		// Update label
		document.querySelector(".mode-number").innerHTML = mode_number;
		
		// Update circles
		const mode_dots = document.querySelectorAll(".mode-dot");
		let i=0;
		for(let dot of mode_dots){
			dot.classList.remove("fill");
			dot.classList.remove("animate-fill");
			if(mode_number > i){
				dot.classList.add("fill");
			}
			i++;
		}

		// Update assist plus
		if(bike.get_assist_plus_is_next_mode()){
			// render mode differently depending
			document.querySelector(".assist-plus").classList.remove("assist-plus-show");
			if(assist_plus){
				if(mode_number < 3){
					document.querySelector(`.mode-dot:nth-child(${mode_number+1})`).classList.add("animate-fill");

					document.querySelector(".mode-number").innerHTML = `(${mode_number+1})`;
				}
			}
		}else{
			if(assist_plus){
				document.querySelector(".assist-plus").classList.add("assist-plus-show");
			}else{
				document.querySelector(".assist-plus").classList.remove("assist-plus-show");
			}
		}
	}

	// Call once to begin
	render_bike();


	// Create Serial connection
	const serial = new Serial({

		check_for_serial: false,
		minimum_write_interval: 25,

		web_serial_error_callback: function(msg){
			document.querySelector('.api_warning').innerHTML = msg;
			document.querySelector('.api_warning').style.display = 'block';
		},

		error_callback: (e) => {
			logger.log(e,{class: "error"});
			document.querySelector(".connect").classList.remove("connected");
		},

		read_callback: (msg) => {
			// Probably a press or release command
			if(msg.length == 2){
				switch(msg.substr(1,1)){

					case '+':
						if(msg.substr(0,1) == 'p'){
							bike.trigger_plus();
						}
						break;

					case '-':
						if(msg.substr(0,1) == 'p'){
							bike.trigger_minus();
						}
						break;

					case 'a':
						if(msg.substr(0,1) == 'p'){
							bike.start_assist_plus();
						}else if(msg.substr(0,1) == 'r'){
							bike.stop_assist_plus();
						}
						break;
				}
				render_bike();
			}
		}
	});*/
	
});



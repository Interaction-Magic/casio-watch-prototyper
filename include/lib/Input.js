//  ***********************************************
//  ***********************************************
//  Input
// 
//  Author: George Cave @ Interaction Magic
//  Date: February 2022
// 
//  ***********************************************
//  
//  Description TBD
// 
//  ***********************************************
// 
//  Usage:
// 
//  TBD
// 
//  Public methods:
// 
//  TBD
//
//  Public properties:
// 
//  TBD
// 
//  ***********************************************

class Input{


	// Default options are below
	_default_opts = {
		log: (msg, opts) => {},	// Handler to log messages
		fire: (type) => {},		// Handler for when the input is triggered
		
      long_press_threshold: 500,
	};

	_click = {
		double_press_threshold: 100,	// gap between end of first click and start of next
      last_press: 0,
      long_press_fired: false,
		half_double_press_fired: false,
		half_double_press: 0,
		pressed: false
	};



	// Requires a reference to div to put the messages in
	constructor(opts){

		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Attach click handling
		this.attach_handlers();

		// Save context
		let self = this;

		// Call first time
		window.requestAnimationFrame(check_for_clicks);

		function check_for_clicks(){
			self._press_check_loop();
			// Do check again!
			window.requestAnimationFrame(check_for_clicks);
		}
	}

	attach_handlers(){

		// Attach handlers to object on screen
		if(this.opts.elm){
			this.opts.elm.addEventListener("mousedown",() => {
				this.down();
			});

			this.opts.elm.addEventListener("mouseout",() => {
				this.opts.elm.classList.remove("pressed");
				this._release(false);
				this.opts.elm.blur();
			})

			this.opts.elm.addEventListener("mouseup",() => {
				this.up();
				this.opts.elm.blur();
			});
		}

		// Attach handlers to main key
		if(this.opts.key){
			document.addEventListener('keydown', (e) => {
				// Avoid repeat firing by checking if already pressed
				if( (e.key == this.opts.key) && (!this._click.pressed) ){
					this.down();
				}
			});
			document.addEventListener('keyup', (e) => {
				if(e.key == this.opts.key){
					this.up();
				}
			});
		}

		// Setup detection for keyboard inputs for hardware  prototyping
		if(this.opts.proto_letters){
			const keys = this.opts.proto_letters;
			document.addEventListener('keydown', (e) => {
				const key = e.key.toLowerCase();

				let animate = false;
				switch(key){
					case keys.single:
						this._handle_press("single");
						animate = true;
						break;
					
					case keys.double:
						this._handle_press("double");
						animate = true;
						break;
					
					case keys.long:
						this._handle_press("long");
						animate = true;
						break;
				}

				if(animate){
					// Animate once
					this.opts.elm.classList.remove("single-press");
					setTimeout(() => {
						this.opts.elm.classList.add("single-press");
					}, 1)
				}
			});
		}
	}

	// Call when there's a push/release down on the button
	down(){
		this.opts.elm.classList.add("pressed");
		this._press();
	}
	up(){
		this.opts.elm.classList.remove("pressed");
		this._release()
	}

	// Handle all button activations
	_handle_press(type){
		this.opts.log(`🕹️ ${this.opts.name.toCapitalized()} button ${type} press`,{
			class: "input"
		});
		this.opts.fire(type);
	}

	// /////////////////////////////////////////////////////////////////
	// Loop logic for single/double/long press is below

	// Call when the press begins
	_press(){
		this._click.last_press = Date.now();
		this._click.pressed = true;
	}
	
	
	// Called as fast as possible to check for types of press events
	_press_check_loop(){
		// Check if we should give up waiting for a second press of the double press
		// Only do this if we are not currently pressed
		if(!this._click.pressed && !this.opts.no_double_press){
			if(
				this._click.half_double_press_fired
				&& (Date.now() > (this._click.half_double_press + this._click.double_press_threshold))
			){
				// Given up, lets just register a normal press!
				this._handle_press("single");
				this._click.half_double_press_fired = false;
			}
		}

		// Check for long pressing if:
		//  + still held down
		//  + threshold exceeded
		//  + have not fired the press event yet
		if(
			this._click.pressed
			&& (Date.now() > this._click.last_press + this.opts.long_press_threshold)
			&& !this._click.long_press_fired
		){
			// Long press threshold exceeded
			this._handle_press("long");
			this._click.long_press_fired = true;
		}
	}

	// Call when the press is released on the input
	_release(do_checks = true){
		this._click.pressed = false;

		if(do_checks){
			if(this.opts.no_double_press){
			
				if(!this._click.long_press_fired){
					// Just fire a single press!
					this._handle_press("single");
				}
	
			}else{	
				// If we haven't fired the longpress already
				if(!this._click.long_press_fired){
					if(this._click.half_double_press_fired){
						// Fire a double click
						this._handle_press("double");
						this._click.half_double_press_fired = false;
					}else{
						// Save the first half of the doublepress
						this._click.half_double_press = Date.now();
						this._click.half_double_press_fired = true;
					}
				}
			}
			this._click.long_press_fired = false;
		}

		
	}
}

// Helper function for formatting strings with first letter as a capital
Object.defineProperty(String.prototype, 'toCapitalized', {
	value: function () {
		return this.charAt(0).toUpperCase() + this.slice(1);
	},
	writable: true, // so that one can overwrite it later
	configurable: true // so that it can be deleted later
});
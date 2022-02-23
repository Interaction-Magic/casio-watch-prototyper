//
// Single sequence step
//

class Sequence_Step{

	// Default options are below
	_default_opts = {
		duration: 500,
		index: 0
	};

	_hover_drag = {
		is_active: false,
		setting_option: false,
		something_changed: false
	};

	// _data.segments sequence is as follows
	//  + Weekday digit 0 [A -> F]
	//  + Weekday digit 1 [A -> F]
	//  + Day digit 2 [A -> F]
	//  + Day digit 3 [A -> F]
	//  + Clock digit 4 [A -> F]
	//  + Clock digit 5 [A -> F]
	//  + Clock digit 6 [A -> F]
	//  + Clock digit 7 [A -> F]
	//  + Clock digit 8 [A -> F]
	//  + Clock digit 9 [A -> F]
	//  + Colon
	//  + Signal
	//  + Bell
	//  + PM
	//  + 24H
	//  + LAP

	_data = {
		segments: [],
		hardware : {
			led_0: false,
			led_1: false,
			buzzer: 0
		}
	};

	_lcd_segments = {
		digits: ["digit_0", "digit_1", "digit_2", "digit_3", "digit_4", "digit_5", "digit_6", "digit_7", "digit_8", "digit_9"],
		digit_letters : ["segment_A", "segment_B", "segment_C", "segment_D", "segment_E", "segment_F", "segment_G"]
	};

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new sequence container in UI 
		this.elm = document.querySelector(".sequence_step_prototype").cloneNode(true);
		this.elm.classList.remove("sequence_step_prototype");

		this.set_index(this.opts.index);
		this.set_duration(this.opts.duration);

		// Insert into DOM
		if(opts.after){
			this.opts.after.after(this.get_dom());
		}else if(opts.before){
			this.opts.before.before(this.get_dom());
		}

		// Add all handlers
		this._add_handlers();

		// Populate sequence data array from segments (probably blank at this stage)
		this.update_sequence_from_segments()

		// Push the provided data to the whole step
		if(this.opts.data){
			this.set_state(this.opts.data);
		}
	}

	//
	// Helpful getters

	// Returns the DOM contents for this step
	get_dom(){
		return this.elm;
	}

	// Returns an object with segment data stored in it
	get_state(){
		return this._data;
	}

	// Other helpful getters
	get_duration(){
		return this.opts.duration;
	}

	//
	// Helpful setters

	// Set the index data for this step
	set_index(index){
		this.elm.dataset.index = index;
		this.elm.querySelector(".number").innerText = `#${index+1}`;
	}

	// Set the duration of the step
	set_duration(duration){
		this.elm.querySelector(".duration").innerText = `${duration}`;
	}

	// Set the whole state
	set_state(data){
		this.set_segments(data.segments);
	}

	// Set the segments based on provided data
	set_segments(segment_data){
		this._data.segments = segment_data;

		for(let group of segment_data){
			switch(group.type){

				case 'digit':
					for(let segment in group.data){
						this.elm.querySelector(`.${group.digit}`).querySelector(`.${segment}`).classList.toggle('on',group.data[segment]);
					}
					break;

				case 'special':
					for(let segment in group.data){
						this.elm.querySelector(`.${segment}`).classList.toggle('on',group.data[segment]);
					}
					break;
			}
		}
	}

	// Deletes this step from the DOM
	remove(){
		this.elm.remove();
	}


	// Returns the segment sequence for this step
	update_sequence_from_segments(){

		this._data.segments = [];

		// Iterate over all digits
		for(let digit of this._lcd_segments.digits){
			const digit_elm = this.elm.querySelector(`.${digit}`);

			let digit_data = {
				type: "digit",
				digit: digit,
				data: {}
			};
			for(let letter of this._lcd_segments.digit_letters){
				const letter_elm = digit_elm.querySelector(`.${letter}`);
				digit_data.data[letter] = this._is_segment_on(letter_elm);
			}

			// Special cases for weekday digits which have extra segments
			if(digit == "digit_0"){
				digit_data.data['segment_H'] = this._is_segment_on(digit_elm.querySelector(`.segment_H`));
				digit_data.data['segment_I'] = this._is_segment_on(digit_elm.querySelector(`.segment_I`));
			}else if(digit == "digit_1"){
				digit_data.data['segment_dot'] = this._is_segment_on(digit_elm.querySelector(`.segment_dot`));
			}

			this._data.segments.push(digit_data);
		}

		// Get data for the "special" section
		this._data.segments.push({
			type: "special",
			data: {
				colon: 	this._is_segment_on(this.elm.querySelector('.colon')),
				signal: 	this._is_segment_on(this.elm.querySelector('.signal')),
				bell: 	this._is_segment_on(this.elm.querySelector('.bell')),
				pm: 		this._is_segment_on(this.elm.querySelector('.pm')),
				hr: 		this._is_segment_on(this.elm.querySelector('.hr')),
				lap: 		this._is_segment_on(this.elm.querySelector('.lap')),
			}
		});
	}

	// Helper to check if a segment is on or off
	_is_segment_on(segment){
		return segment.classList.contains("on");
	}

	// Fires an event to trigger an update
	_fire_update(){
		this.elm.dispatchEvent(new CustomEvent("updated", {
			bubbles: true
		}));
	}


	//
	// Create handlers for clicks on this step
	_add_handlers(){
		// ////////////////
		// Set handlers for hardware options
		this.elm.querySelectorAll(".led_button").forEach((led_button) => {
			led_button.addEventListener("click", (e) => {
				e.preventDefault();
				led_button.classList.toggle("on");
				this._data.hardware[led_button.dataset.colour] = led_button.classList.contains("on");

				this._fire_update();
			});
		});


		// ////////////////
		// Set handlers for toggling segments on and off

		// ////////////////
		// Set handler for duration editing
		this.elm.querySelector(".duration").addEventListener('keydown', function(e) {
			if(e.key === 'Enter'){
				e.preventDefault();
			  	e.target.blur();
				this._fire_update();
			}
		});
		this.elm.querySelector(".duration").addEventListener("blur", (e) => {
			e.preventDefault();
			this.set_duration(parseInt(e.target.innerHTML));
			e.target.innerHTML = this.opts.duration; // update back 
			this._fire_update();
		});

		// When dragging _not_ from a segment, use mouse to toggle segments on/off
		this.elm.querySelector(".watch_face").addEventListener("mousedown", (e) => {
			e.preventDefault();
			this._hover_drag.is_active = true;
			this._hover_drag.setting_option = "toggle";
		});


		this.elm.querySelectorAll(".lcd_segment").forEach((segment) => {
			// On mouse down, toggle and start drag based on state change that just occurred
			segment.addEventListener("mousedown", (e) => {
				e.preventDefault();
				e.stopPropagation();

				this._hover_drag.is_active = true;

				segment.classList.toggle("on");
				segment.classList.remove("hover");
				this._hover_drag.setting_option = segment.classList.contains("on");

				this.update_sequence_from_segments();
				this._fire_update();
			});
			segment.addEventListener("mouseenter", (e) => {
				e.preventDefault();
				if(this._hover_drag.is_active){
					if(this._hover_drag.setting_option == "toggle"){
						segment.classList.toggle("on");
						this._hover_drag.something_changed = true;
						this.update_sequence_from_segments();
					}else{
						segment.classList.toggle("on", this._hover_drag.setting_option);
						this._hover_drag.something_changed = true;
						this.update_sequence_from_segments();
					}
				}else{
					segment.classList.add("hover");
				}
			})
			segment.addEventListener("mouseleave", (e) => {
				e.preventDefault();
				segment.classList.remove("hover");
			});
		});
		document.addEventListener("mouseup", (e) => {
			this._hover_drag.is_active = false;
			if(this._hover_drag.something_changed){
				this._hover_drag.something_changed = false;
				this._fire_update();
			}
		});

	}
}
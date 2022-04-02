//
// Single sequence step
//

class Step{

	// Default options are below
	_default_opts = {
		duration: 500,
		template_class: 'sequence_step_template',
		is_segment_coupling: true
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
		index: -1,
		order: -1,
		segments: [],
		hardware : {
			led_0: false,
			led_1: false,
			buzzer: 0
		},
		duration: 0
	};

	_lcd_segments = {
		digits: ["digit_0", "digit_1", "digit_2", "digit_3", "digit_4", "digit_5", "digit_6", "digit_7", "digit_8", "digit_9"],
		digit_letters : ["segment_A", "segment_B", "segment_C", "segment_D", "segment_E", "segment_F", "segment_G"]
	};

	_segment_couples = [
		[
			{digit: "digit_1",	segment: "segment_B"},
			{digit: "digit_1",	segment: "segment_C"}
		],
		[
			{digit: "digit_1",	segment: "segment_E"},
			{digit: "digit_1",	segment: "segment_F"}
		],
		[
			{digit: "digit_2",	segment: "segment_A"},
			{digit: "digit_2",	segment: "segment_D"},
			{digit: "digit_2",	segment: "segment_G"}
		],
		[
			{digit: "digit_4",	segment: "segment_A"},
			{digit: "digit_4",	segment: "segment_D"}
		],
		[
			{digit: "digit_6",	segment: "segment_A"},
			{digit: "digit_6",	segment: "segment_D"}
		]
	];

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new sequence container in UI 
		this.dom = document.querySelector(`.${this.opts.template_class}`).cloneNode(true);
		this.dom.classList.remove(this.opts.template_class);

		// Insert into DOM
		if(this.opts.after){
			this.opts.after.after(this.dom);
		}else{
			this.opts.before.before(this.dom);
		}

		// Add all handlers
		this._add_handlers();

		// Populate sequence data array from segments (blank at this stage)
		this._update_sequence_from_segments()

		// Push the provided data to the whole step
		this.set_index(this.opts.index);
		this.set_order(this.opts.order);
		this.set_segments(this.opts.segments);
		this.set_duration(this.opts.duration);
		this.set_hardware(this.opts.hardware);
	}

	//
	// Helpful getters

	// Returns the DOM contents for this step
	get_dom(){
		return this.dom;
	}

	// Returns an object with segment data stored in it
	get_data(){
		return this._data;
	}

	// Other helpful getters
	get_duration(){
		return this._data.duration;
	}
	get_index(){
		return this._data.index;
	}
	get_order(){
		return this._data.order;
	}

	//
	// Helpful setters

	// Set the index data for this step
	set_index(index){
		if(!isFinite(index)) return;
		this._data.index = index;
		this.dom.dataset.index = index;
	}

	// Set the order for this step
	set_order(order){
		if(!isFinite(order)) return;
		this._data.order = order;
		this.dom.querySelector(".number").innerText = `#${order+1}`;
	}

	// Set the duration of the step
	set_duration(duration){
		if(!duration) return;
		this._data.duration = duration;
		this.dom.querySelector(".duration").innerText = `${duration}`;
	}

	// Set lights and buzzer for this step
	set_hardware(hardware){
		if(!hardware) return;
		this._data.hardware = hardware;

		this.dom.querySelector(`.led_0`).classList.toggle('on',hardware.led_0);
		this.dom.querySelector(`.led_1`).classList.toggle('on',hardware.led_1);

		this.dom.querySelectorAll(`.buzzer option`).forEach((option) => {
			if(option.value == hardware.buzzer){
				option.setAttribute("selected","selected");
			}else{
				option.removeAttribute("selected");
			}
		});
	}

	// Set the segments based on provided data
	set_segments(segment_data){
		if(!segment_data) return;
		this._data.segments = segment_data;

		for(let group of segment_data){
			switch(group.type){

				case 'digit':
					for(let segment in group.data){
						this.dom.querySelector(`.${group.digit}`).querySelector(`.${segment}`).classList.toggle('on',group.data[segment]);
					}
					break;

				case 'special':
					for(let segment in group.data){
						this.dom.querySelector(`.${segment}`).classList.toggle('on',group.data[segment]);
					}
					break;
			}
		}

		this._update_sequence_from_segments();
	}

	// Set whether to apply segment coupling or not
	set_segment_coupling(is_set){
		this.opts.is_segment_coupling = is_set;
	}

	// Deletes this step from the DOM
	delete(){
		this.dom.remove();
	}

	// Check if this segment is coupled to any others and change those as well
	_check_and_apply_segment_coupling(segment_dom){

		if(!this.opts.is_segment_coupling){
			return;
		}

		if(!segment_dom.dataset.segment){
			return;
		}

		const digit = segment_dom.parentNode.classList[0];
		const segment = `segment_${segment_dom.dataset.segment}`;

		for(let couple of this._segment_couples){
			for(let seg of couple){
				if((seg.digit == digit) && (seg.segment == segment)){
					// Apply it to them all
					const segment_state = segment_dom.classList.contains("on");
					for(let seg2 of couple){
						this.dom.querySelector(`.${seg2.digit} .${seg2.segment}`).classList.toggle('on', segment_state);
					}
				}
			}
		}
	}

	// Returns the segment sequence for this step
	_update_sequence_from_segments(){

		this._data.segments = [];

		// Iterate over all digits
		for(let digit of this._lcd_segments.digits){
			const digit_elm = this.dom.querySelector(`.${digit}`);

			let digit_data = {
				type: "digit",
				digit: digit,
				data: {}
			};
			for(let letter of this._lcd_segments.digit_letters){
				if((digit == 'digit_2') && (letter  == 'segment_F')){
					// Special case we're missing a pixel here
					continue;
				}
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
				colon: 	this._is_segment_on(this.dom.querySelector('.colon')),
				signal: 	this._is_segment_on(this.dom.querySelector('.signal')),
				bell: 	this._is_segment_on(this.dom.querySelector('.bell')),
				pm: 		this._is_segment_on(this.dom.querySelector('.pm')),
				hr: 		this._is_segment_on(this.dom.querySelector('.hr')),
				lap: 		this._is_segment_on(this.dom.querySelector('.lap')),
			}
		});
	}

	// Helper to check if a segment is on or off
	_is_segment_on(segment){
		return segment.classList.contains("on");
	}

	// Fires an event to trigger an update
	_fire_update(){
		this.dom.dispatchEvent(new CustomEvent("updated", {
			bubbles: true
		}));
	}


	//
	// Create handlers for clicks on this step
	_add_handlers(){

		// ////////////////
		// Set handlers for hardware options
		this.dom.querySelectorAll(".led_button").forEach((led_button) => {
			led_button.addEventListener("click", (e) => {
				e.preventDefault();
				led_button.classList.toggle("on");
				this._data.hardware[led_button.dataset.colour] = led_button.classList.contains("on");

				this._fire_update();
			});
		});
		
		this.dom.querySelector(".buzzer").addEventListener("change", (e) => {
			e.preventDefault();
			this._data.hardware.buzzer = e.target.value;

			this._fire_update();

			// Temporarily play a sound to show what we selected
			const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
			const oscillator = audioCtx.createOscillator();
			oscillator.type = 'sine';
			oscillator.frequency.setValueAtTime(e.target.value, audioCtx.currentTime);
			oscillator.connect(audioCtx.destination);
			oscillator.start();
			oscillator.stop(audioCtx.currentTime + 0.25);
		});



		// ////////////////
		// Set handler for duration editing
		this.dom.querySelector(".duration").addEventListener('keydown', (e) => {
			if(e.key === 'Enter'){
				e.preventDefault();
			  	e.target.blur();
			}
		});
		this.dom.querySelector(".duration").addEventListener("blur", (e) => {
			e.preventDefault();
			if(parseInt(e.target.innerHTML) != this._data.duration){
				this.set_duration(parseInt(e.target.innerHTML));
				e.target.innerHTML = this._data.duration; // update back 
				this._fire_update();
			}
		});


		// ////////////////
		// Set handlers for toggling segments on and off

		// When dragging _not_ from a segment, use mouse to toggle segments on/off
		this.dom.querySelector(".watch_face").addEventListener("mousedown", (e) => {
			e.preventDefault();
			this._hover_drag.is_active = true;
			this._hover_drag.setting_option = "toggle";
		});


		this.dom.querySelectorAll(".lcd_segment").forEach((segment) => {
			// On mouse down, toggle and start drag based on state change that just occurred
			segment.addEventListener("mousedown", (e) => {
				e.preventDefault();
				e.stopPropagation();

				this._hover_drag.is_active = true;

				segment.classList.toggle("on");
				this._check_and_apply_segment_coupling(segment);

				segment.classList.remove("hover");
				this._hover_drag.setting_option = segment.classList.contains("on");

				this._update_sequence_from_segments();
				this._fire_update();
			});
			segment.addEventListener("mouseenter", (e) => {
				e.preventDefault();
				if(this._hover_drag.is_active){
					if(this._hover_drag.setting_option == "toggle"){

						segment.classList.toggle("on");
						this._check_and_apply_segment_coupling(segment);

						this._hover_drag.something_changed = true;
						this._update_sequence_from_segments();

					}else{

						segment.classList.toggle("on", this._hover_drag.setting_option);
						this._check_and_apply_segment_coupling(segment);

						this._hover_drag.something_changed = true;
						this._update_sequence_from_segments();
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
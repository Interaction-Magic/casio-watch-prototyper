//
// Single animation step
//

class Animation_Step{

	// Default options are below
	_default_opts = {
		duration: 500,
		index: 0
	};

	_hover_drag = {
		is_active: false,
		setting_option: false
	};

	_segment_data = [];

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new animation container in UI 
		this.elm = document.querySelector(".animation_step_prototype").cloneNode(true);
		this.elm.classList.remove("animation_step_prototype");
		this.elm.querySelector(".number").innerText = `#${this.opts.index}`;
		this.elm.querySelector(".duration").innerText = `${this.opts.duration}`;

		// Set handlers for toggling segments on and off
		this.elm.querySelector(".watch_face").addEventListener("mousedown", (e) => {
			e.preventDefault();
			this._hover_drag.is_active = true;
			this._hover_drag.setting_option = "toggle";
		});

		this.elm.querySelectorAll(".lcd_segment").forEach((segment) => {
			segment.addEventListener("mousedown", (e) => {
				e.preventDefault();
				e.stopPropagation();

				this._hover_drag.is_active = true;

				segment.classList.toggle("on");
				segment.classList.remove("hover");
				this._hover_drag.setting_option = segment.classList.contains("on");

				this.update_sequence();
			});
			segment.addEventListener("mouseenter", (e) => {
				e.preventDefault();
				if(this._hover_drag.is_active){
					if(this._hover_drag.setting_option == "toggle"){
						segment.classList.toggle("on");
						this.update_sequence();
					}else{
						segment.classList.toggle("on", this._hover_drag.setting_option);
						this.update_sequence();
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
		});

		this.update_sequence();
	}

	//
	// Returns the DOM contents for this step
	get_dom(){
		return this.elm;
	}

	// Returns the segment sequence for this step
	update_sequence(){

		// Element sequence is as follows
		// Weekday digit 0 [A -> F]
		// Weekday digit 1 [A -> F]
		// Day digit 2 [A -> F]
		// Day digit 3 [A -> F]
		// Clock digit 4 [A -> F]
		// Clock digit 5 [A -> F]
		// Clock digit 6 [A -> F]
		// Clock digit 7 [A -> F]
		// Clock digit 8 [A -> F]
		// Clock digit 9 [A -> F]
		// Colon
		// Signal
		// Bell
		// PM
		// 24H
		// LAP

		this._segment_data = [];

		const digits = ["digit_0", "digit_1", "digit_2", "digit_3", "digit_4", "digit_5", "digit_6", "digit_7", "digit_8", "digit_9"];
		const digit_letters = ["segment_A", "segment_B", "segment_C", "segment_D", "segment_E", "segment_F", "segment_G"];

		// Iterate over all digits
		for(let digit of digits){
			const digit_elm = this.elm.querySelector(`.${digit}`);

			let digit_data = {
				group: digit,
				data: {}
			};
			for(let letter of digit_letters){
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

			this._segment_data.push(digit_data);
		}

		// Get data for the "special" section
		this._segment_data.push({
			group: "special",
			data: {
				colon: 	this._is_segment_on(this.elm.querySelector('.colon')),
				signal: 	this._is_segment_on(this.elm.querySelector('.signal')),
				bell: 	this._is_segment_on(this.elm.querySelector('.bell')),
				pm: 		this._is_segment_on(this.elm.querySelector('.pm')),
				hr: 		this._is_segment_on(this.elm.querySelector('.hr')),
				lap: 		this._is_segment_on(this.elm.querySelector('.lap')),
			}
		});

		console.log(this._segment_data);
	}

	_is_segment_on(segment){
		return segment.classList.contains("on");
	}
}
//
// Wrapper class for the whole designer
//

class Designer{

	// Default options are below
	_default_opts = {
	};

	_sequences = [];

	_animation = {
		is_playing: false,
		start_time: 0,
		current_sequence_index: 0,
		is_buzzing: false,
		buzzing_freq: 0
	};
	
	audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create an undo handler
		this.undo = new Undo({
			undo_elm: document.querySelector(".undo"),
			undoundo_elm: document.querySelector(".undoundo"),
			save_to_storage: true
		});

		// Restore from whevere we want to
		if(this.undo.has_retrieved_from_storage){

			// Load from storage data
			this.put_state(this.undo.retrieve());

		}else if(this.opts.data != null){

			// Load from provided data
			this.put_state(this.opts.data);

		}else{

			// Create a default sequence
			this.add_sequence();
			this._animation.current_sequence_index = 0;
			this.history_save();

		}

		this._add_handlers();
	}

	add_sequence(sequence_data = null){

		const sequence = new Sequence({
			container: this.opts.sequences_container,
			prototype_container: document.querySelector(".sequence_prototype"),
			data: sequence_data,
			name: `Sequence ${this._sequences.length}`
		});

		this._sequences.push(sequence);
	}

	play(){
		this._animation.start_time = Date.now();
		this._animation.is_playing = true;
		window.requestAnimationFrame(() => this._render_loop());
	}
	pause(){
		this._animation.is_playing = false;
		this._stop_oscillator();
	}
	play_pause(){
		if(this._animation.is_playing){
			this.pause();
		}else{
			this.play();
		}
	}

	// Save the current state
	history_save(){
		const state = this.get_state();
		this.undo.save(state);
	}

	// Undo events
	history_undo(){
		const undo_data = this.undo.undo();
		if(undo_data){
			this.put_state(undo_data);
		}
	}
	history_undoundo(){
		const undo_data = this.undo.undoundo();
		if(undo_data){
			this.put_state(undo_data);
		}
	}

	// Retrieves array of all data for current setup
	get_state(){
		const data = {
			start_time: this._animation.start_time,
			current_sequence_index: this._animation.current_sequence_index,
			sequences: []
		};
		for(let sequence of this._sequences){
			data.sequences.push(sequence.get_state());
		}
		return data;
	}

	// Overwrites the whole designer with all the provided data
	put_state(data){

		// Wipe all sequences
		this._sequences.splice(0, this._sequences.length);

		// Empy sequence holder
		this.opts.sequences_container.innerHTML = "";

		// Generate new sequences
		for(let sequence_data of data.sequences){
			this.add_sequence(sequence_data);
		}

		// Save animation properties
		this._animation.start_time = data.start_time;
		this._animation.current_sequence_index = data.current_sequence_index;

	}

	_render_loop(){

		if(!this._animation.is_playing){
			return;
		}

		// Get data for current step of active sequence
		const step = this._sequences[this._animation.current_sequence_index].get_step(this._animation.start_time);
		const step_data = step.get_state();

		this.write(step_data);
 
		if(this._animation.is_playing){
			window.requestAnimationFrame(() => this._render_loop());
		}
	}

	//
	// Writes the segment display to the live view of the watch on the screen 
	write(data){
		// Reference for watch element
		const watch = this.opts.live_watch;

		// Fill in all segments 
		for(let group of data.segments){
			switch(group.type){

				case 'digit':
					for(let segment in group.data){
						watch.querySelector(`.${group.digit}`).querySelector(`.${segment}`).classList.toggle('on',group.data[segment]);
					}
					break;

				case 'special':
					for(let segment in group.data){
						watch.querySelector(`.${segment}`).classList.toggle('on',group.data[segment]);
					}
					break;
			}
		}

		// Display lights
		watch.querySelector(`.led_0`).classList.toggle('on',data.hardware.led_0);
		watch.querySelector(`.led_1`).classList.toggle('on',data.hardware.led_1);

		// Play tone
		if(data.hardware.buzzer > 0){
			if(this._animation.buzzing_freq == data.hardware.buzzer){
				// Same frequency as before
				if(!this._animation.is_buzzing){
					// But not buzzing, so start again
					this._create_oscillator(data.hardware.buzzer);
				}
			}else{
				// New frequency, stop and start again
				this._stop_oscillator();
				this._create_oscillator(data.hardware.buzzer);
			}
		}else{
			this._stop_oscillator();
		}
	}

	//
	// Oscillator helpers
	_stop_oscillator(){
		if(this._animation.is_buzzing){
			this.oscillator.stop();
			this._animation.is_buzzing = false;
		}
	}
	_create_oscillator(frequency){
		// Setup buzzer
		this.oscillator = this.audioCtx.createOscillator();
		this.oscillator.type = 'sine';
		this.oscillator.connect(this.audioCtx.destination);
		this.oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
		this.oscillator.start();
		this._animation.is_buzzing = true;
		this._animation.buzzing_freq = frequency;
	}

	_add_handlers(){

		// Listener for "updated" triggers to initiate a state save
		this.opts.sequences_container.addEventListener("updated", (e) => {
			this.history_save();
		});

		// Listener for duplicate / delete sequence buttons
		this.opts.sequences_container.addEventListener("click", (e) => {
			e.preventDefault();

			// Get the hash, to work out what sort of switch it is
			const url_target = e.target.href;
			if(!url_target){
				return;
			}
			const hash = url_target.substring(url_target.indexOf('#') + 1);
			
			// TODO: Clean up this dodgy traverse!
			const sequence_id = e.target.parentNode.parentNode.parentNode.parentNode; //.dataset.index;

			console.log(sequence_id);
/*
			switch(hash){
				case "sequence_duplicate":
					this.step_insert_after(step_id, true);
					this._fire_update();
					e.target.blur();
					break;
				case "sequence_delete":
					this.step_delete(step_id);
					this._fire_update();
					e.target.blur();
					break;
			}*/
		});
	}
}

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
		current_sequence: null
	};

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create first sequence
		this.add_sequence();
		this._animation.current_sequence = this._sequences[0];

		// Create an undo handler
		this.undo = new Undo();

		// Save the starting state as the first one
		this.history_save();

		// Listener for "updated" triggers to initiate a state save
		this.opts.sequences_container.addEventListener("updated", (e) => {
			this.history_save();
		});
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
	}
	play_pause(){
		if(this._animation.is_playing){
			this.pause();
		}else{
			this.play();
		}
	}

	// Undo events
	history_save(){
		this.undo.save(this.get_state());
	}
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
	}

	_render_loop(){

		// Get data for current step of active sequence
		const step = this._animation.current_sequence.get_step(this._animation.start_time);
		const step_data = step.get_state();

		this.write(step_data);
 
		if(this._animation.is_playing){
			window.requestAnimationFrame(() => this._render_loop());
		}
	}

	//
	// Writes the segment display to the live view of the watch on the screen 
	write(data){
		const watch = this.opts.live_watch;

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
	}
}

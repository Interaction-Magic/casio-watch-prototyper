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
	}

	add_sequence(){

		const sequence = new Sequence({
			container: document.querySelector(".sequences"),
			prototype_container: document.querySelector(".sequence_prototype")
		});

		this._sequences.push(sequence);
	}

	play(){
		this._animation.start_time = Date.now();
		this._animation.is_playing = true;
		window.requestAnimationFrame(() => this.render_loop());
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

	render_loop(){

		// Get data for current step of active sequence
		const step = this._animation.current_sequence.get_step(this._animation.start_time);
		const sequence_data = step.get_data();

		this.write(sequence_data);
 
		if(this._animation.is_playing){
			window.requestAnimationFrame(() => this.render_loop());
		}
	}

	//
	// Writes the segment display to the live view of the watch on the screen 
	write(segment_data){
		const watch = this.opts.live_watch;

		for(let group of segment_data){
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

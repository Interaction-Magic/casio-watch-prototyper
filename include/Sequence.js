//
// Single sequence, may have multiple steps
//

class Sequence{

	// Default options are below
	_default_opts = {
		container: null,
		prototype_container: null
	};

	_steps = [];
	_total_duration = 0;

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new sequence container in UI 
		this.opts.elm = this.opts.prototype_container.cloneNode(true);
		this.opts.elm.classList.remove("sequence_prototype");
		this.opts.container.append(this.opts.elm);

		// Add the first step for the sequence
		this.add_step();

		// Add some event handlers
		this.opts.elm.querySelector(".add_step").addEventListener("click", () => {
			this.add_step();
		});
	}

	//
	// Calculate which step of the animation we are on, based on the start time and current time
	get_step(start_time, time_now = Date.now()){
		
		const time_point = (time_now-start_time) % this._total_duration;

		let duration_before_this_step = 0;
		for(let step of this._steps){
			if(time_point < (duration_before_this_step + step.get_duration())){
				// It's this step
				return step;

			}else{
				duration_before_this_step += step.get_duration();
			}
		}
		return step;
	}

	// Re-calculate the total sequence length
	update_total_duration(){
		
		this._total_duration = 0;
		for(let step of this._steps){
			this._total_duration += step.get_duration();
		}
	}

	// Add a new step to the sequence
	add_step(){

		// Create step
		const new_step = new Sequence_Step({
			index: this._steps.length
		});
		
		// Add to screen
		const new_step_dom = new_step.get_dom();
		this.opts.elm.querySelector(".sequence_steps").querySelector(".add_step").before(new_step_dom);

		// Add handler to capture duration changes
		new_step_dom.querySelector(".duration").addEventListener("blur", (e) => {
			this.update_total_duration();
		});

		// Save step
		this._steps.push(new_step);

		// Re-calculate the length
		this.update_total_duration();
	}
}

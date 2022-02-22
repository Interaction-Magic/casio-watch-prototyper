//
// Single animation, may have multiple steps
//

class Animation{

	// Default options are below
	_default_opts = {
		container: null,
		prototype_container: null
	};

	_steps = [];

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new animation container in UI 
		this.opts.elm = this.opts.prototype_container.cloneNode(true);
		this.opts.elm.classList.remove("animation_prototype");
		this.opts.container.append(this.opts.elm);

		this.add_step();

		// Add some event handlers
		this.opts.elm.querySelector(".add_step").addEventListener("click", () => {
			this.add_step();
		});
	}

	//
	// Returns an array of data for the current display
	get_segment_sequence(){

	}

	add_step(){

		// Create step
		const new_step = new Animation_Step({
			index: this._steps.length
		});
		
		// Add to screen
		this.opts.elm.querySelector(".add_step").before(new_step.get_dom());

		console.log(new_step.get_dom());

		// Save step
		this._steps.push(new_step);
	}
}

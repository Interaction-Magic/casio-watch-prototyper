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
		this.step_add();

		// Add some event handlers across the whole sequence
		this.opts.elm.querySelector(".add_step").addEventListener("click", (e) => {
			e.preventDefault();
			this.step_add();
		});
		this.opts.elm.addEventListener("click", (e) => {
			e.preventDefault();
			const url_target = e.target.href;

			if(!url_target){
				return;
			}
			const hash = url_target.substring(url_target.indexOf('#') + 1);
			
			// TODO: Clean up this dodgy traverse!
			const step_id = e.target.parentNode.parentNode.parentNode.dataset.index;

			switch(hash){
				case "step_duplicate":
					this.step_insert_after(step_id, true);
					break;
				case "step_delete":
					this.step_delete(step_id);
					break;
			}
		})
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
	step_add(after_elm = null){

		// Create step
		const new_step = new Sequence_Step({
			index: this._steps.length
		});

		// Save step
		if(after_elm){
			this._steps.splice(after_elm.dataset.index+1,0,new_step);
		}else{
			this._steps.push(new_step);
		}
		
		// //////////////
		// Do DOM display stuff
		// TODO: Move this to the step itself?

		// Get DOM for new step
		const new_step_dom = new_step.get_dom();

		// Work out where to add it
		if(after_elm){
			// After a given element
			after_elm.after(new_step_dom);
		}else{
			// Put it at the end
			this.opts.elm.querySelector(".add_step").before(new_step_dom);
		}
		// Add handler to capture duration changes
		new_step_dom.querySelector(".duration").addEventListener("blur", (e) => {
			this.update_total_duration();
		});

		// Re-calculate things
		this.recalculate_step_indices();
		this.update_total_duration();
	}

	step_insert_after(index, is_duplicate){
	//	if(!is_duplicate){
			this.step_add(this._steps[index].get_dom());
	//	}
	}

	// Delete a step at a given index
	step_delete(index){
		this._steps[index].remove();
		this._steps.splice(index, 1);

		this.recalculate_step_indices();
		this.update_total_duration();
	}

	// Re-calculate the index of all steps
	recalculate_step_indices(){
		let i=0;
		for(let step of this._steps){
			step.set_index(i);
			i++;
		}
	}

	// //////////////////////////////////////
	// Helper functions

}

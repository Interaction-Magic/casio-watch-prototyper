//
// Single sequence, may have multiple steps
//

class Sequence{

	// Default options are below
	_default_opts = {
		container: null,
		prototype_container: null
	};

	_data = {
		name: "",
		index: 0,
		order: 0,

		steps: [],

		display: {
			is_minimised: false
		}
	};

//	_steps = [];
	_total_duration = 0;

//	_name = "";
//	_index = 0;

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new sequence container in UI 
		this.dom = this.opts.prototype_container.cloneNode(true);
		this.dom.classList.remove("sequence_prototype");

		// Attach to the DOM
		if(this.opts.after){
			this.opts.after.after(this.dom);
		}else{
			this.opts.container.append(this.dom);
		}

		if(this.opts.data != null){
			// We have incoming data to build from, so build from this

			// Set sequence properties
			this.set_name(this.opts.data.name);
			this.set_index(this.opts.data.index);

			// Generate all the steps
			for(let step_data of this.opts.data.steps){
				this.step_add(step_data);
			}
		}else{
			// No incoming data, add defaults
			this.step_add();
		}

		this.set_name(this.opts.name);
		this.set_index(this.opts.index);

		// Event handlers for the sequence options
		this._add_event_handlers();
		

		// Add some event handlers across the whole sequence
		this.dom.querySelector(".add_step").addEventListener("click", (e) => {
			e.preventDefault();
			this.step_add();
			this._fire_update();
		});
		this.dom.addEventListener("click", (e) => {
			e.preventDefault();

			// Get the hash, to work out what sort of switch it is
			const url_target = e.target.href;
			if(!url_target){
				return;
			}
			const hash = url_target.substring(url_target.indexOf('#') + 1);
			
			// TODO: Clean up this dodgy traverse!
			const step_id = e.target.parentNode.parentNode.parentNode.parentNode.dataset.index;

			switch(hash){
				case "step_duplicate":
					this.step_insert_after(step_id, true);
					this._fire_update();
					e.target.blur();
					break;
				case "step_delete":
					this.step_delete(step_id);
					this._fire_update();
					e.target.blur();
					break;
				case "minimise":
					this.dom.classList.toggle("minimised");
					e.target.blur();
					break;
			}
		});
	}

	// Retrieves array of all the data for this sequence
	get_state(){
		const data = {
			index: this._index,
			name: this._name,
			steps: []
		};
		for(let step of this._steps){
			data.steps.push(step.get_state());
		}
		return data;
	}

	get_index(){
		return this._index;
	}

	get_dom(){
		return this.dom;
	}

	// Delete this sequence
	remove(){
		this.dom.remove();
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

	// Set the name of the sequence
	set_name(name){
		this._name = name;
		this.dom.querySelector(".name").textContent = name;
	}

	// Set the index for this step
	set_index(index){
		this._index = index;
		this.dom.dataset.index = index;
	}

	//
	// Add a new step to the sequence
	step_add(step_data = null, after_elm = null){

		// Placeholder for new step data
		const step_opts = {
			index: this._steps.length,
			data: step_data
		};

		if(after_elm){
			// After a given element
			step_opts.after = after_elm
		}else{
			// Put it at the end
			step_opts.before = this.dom.querySelector(".add_step");
		}

		// Create step
		const new_step = new Sequence_Step(step_opts);

		// Save step to list
		if(after_elm){
			this._steps.splice(after_elm.dataset.index+1,0,new_step);
		}else{
			this._steps.push(new_step);
		}
		
		// Add special handler to capture duration changes and re-calculate total sequence duration
		new_step.get_dom().querySelector(".duration").addEventListener("blur", (e) => {
			this.update_total_duration();
			console.log(this._total_duration);
		});

		// Re-calculate things
		this.recalculate_step_indices();
		this.update_total_duration();
	}

	// Inserts a new step after the current one
	step_insert_after(index, is_duplicate){
		this.step_add(is_duplicate ? this._steps[index].get_state() : null, this._steps[index].get_dom());
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

	// Fires an event to trigger an update
	_fire_update(){
		this.dom.dispatchEvent(new CustomEvent("updated", {
			bubbles: true
		}));
	}

	_add_event_handlers(){



		
		// Set handler for name editing
		this.dom.querySelector(".name").addEventListener('keydown', (e) => {
			if(e.key === 'Enter'){
				e.preventDefault();
				e.target.blur();
				if(e.target.innerHTML != this._name){
					this.set_name(e.target.innerHTML);
					this._fire_update();
				}
			}
		});
		this.dom.querySelector(".name").addEventListener("blur", (e) => {
			e.preventDefault();
			if(e.target.innerHTML != this._name){
				this.set_name(e.target.innerHTML);
				this._fire_update();
			}
		});
	}
}

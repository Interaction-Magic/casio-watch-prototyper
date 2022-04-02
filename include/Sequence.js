//
// Single sequence, may have multiple steps
//

class Sequence{

	// Default options are below
	_default_opts = {
		name: 				"New sequence",
		template_class: 	'sequence_template',
		index: 				0,
		is_segment_coupling: true
	};

	_data = {
		name: "",
		index: -1,
		order: -1,

		steps: [],

		triggers: {
			mode: -1,
			light: -1,
			alarm: -1
		}
	};

	_total_duration = 0;
	_index_counter = 0;

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		// Create new sequence container in UI 
		this.dom = document.querySelector(`.${this.opts.template_class}`).cloneNode(true);
		this.dom.classList.remove(this.opts.template_class);

		// Attach to the DOM
		if(this.opts.after){
			this.opts.after.after(this.dom);
		}else{
			this.opts.container.append(this.dom);
		}

		if(this.opts.data != null){
			// We have incoming data to build from, so build from this instead

			// Set sequence properties
			this.set_name(this.opts.data.name);
			this.set_index(this.opts.data.index);

			// Save the triggers, we will use these later after all sequences have been loaded
			if(this.opts.data.triggers){
				this._data.triggers = this.opts.data.triggers;
			}

			// Sort array by index to get into correct order for DOM
			this.opts.data.steps.sort((a, b) => (a.order > b.order) ? 1 : -1);

			// Generate all the steps
			for(let step_data of this.opts.data.steps){
				const new_step = this.step_add(step_data);
				this._index_counter = Math.max(this._index_counter, new_step.get_index());
			}
			this._index_counter++;

		}else{
			// No incoming data, add some defaults
			this.set_name(this.opts.name);
			this.set_index(this.opts.index);
			this.step_add();
		}

		// Create event handlers
		this._add_event_handlers();

		this._recalculate_step_order();
	}

	// Retrieves array of all the data for this sequence
	get_data(){
		const data = {
			name: 		this._data.name,
			index: 		this._data.index,
			order: 		this._data.order,
			triggers: 	this._data.triggers,
			steps: []
		};
		for(let step of this._data.steps){
			data.steps.push(step.get_data());
		}
		return data;
	}

	// Some handy getters
	get_index(){
		return this._data.index;
	}
	get_dom(){
		return this.dom;
	}
	get_order(){
		return this._data.order;
	}
	get_name(){
		return this._data.name;
	}
	get_trigger(button){
		return this._data.triggers[button];
	}

	//
	// Calculate which step of the animation we are on, based on the start time and current time
	get_current_step(start_time, time_now = Date.now()){

		if(this._data.steps.length <= 0){
			return false;
		}
		
		const time_point = (time_now-start_time) % this._total_duration;

		let duration_before_this_step = 0;
		for(let step of this._data.steps){
			if(time_point < (duration_before_this_step + step.get_duration())){
				// It's this step
				return step;

			}else{
				duration_before_this_step += step.get_duration();
			}
		}
		return step;
	}

	//
	// Setters

	// Set the name of the sequence
	set_name(name){
		this._data.name = name;
		this.dom.querySelector(".name").textContent = name;
	}

	// Set the index for this step
	set_index(index){
		this._data.index = index;
		this.dom.dataset.index = index;
	}

	// Set the order
	set_order(order){
		this._data.order = order;
	}

	// Set triggers
	set_trigger(button, action){
		this._data.triggers[button] = action;
		this.dom.querySelector(`.button_${button}`).value = action;
	}

	// Set all triggers
	set_all_triggers(){
		this.set_trigger('mode', this._data.triggers.mode);
		this.set_trigger('alarm', this._data.triggers.alarm);
		this.set_trigger('light', this._data.triggers.light);
	}

	// Set whether we are doing segment couplinh or not
	set_segment_coupling(is_set){
		
		this.opts.is_segment_coupling = is_set;

		for(let step of this._data.steps){
			step.set_segment_coupling(is_set);			
		}
	}

	//
	// Add a new step to the sequence
	step_add(opts){

		// New step data
		const step_opts = {
			before: this.dom.querySelector('.add_step'),
			index:	++this._index_counter,
			is_segment_coupling: this.opts.is_segment_coupling 
		};

		// Create step
		const new_step = new Step({...step_opts, ...opts});

		// Save step to list
		this._data.steps.push(new_step);
		
		// Add special handler to capture duration changes and re-calculate total sequence duration
		new_step.get_dom().querySelector(".duration").addEventListener("blur", (e) => {
			this._update_total_duration();
		});

		// Add special event handler to capture Ctrl+Enter to update all step times
		new_step.get_dom().querySelector(".duration").addEventListener('keydown', (e) => {
			if (e.key == 'Enter' && (e.ctrlKey || e.metaKey)) {
				const new_duration = parseInt(e.target.innerHTML);
				for(let step of this._data.steps){
					step.set_duration(new_duration);
				}
				this._fire_update();
				e.target.blur();
			}
		});


		// Re-calculate things
		this._recalculate_step_order();
		this._update_total_duration();

		return new_step;
	}

	// Delete a step at a given index
	step_delete(step){
		step.delete();
		for(let i=0; i<this._data.steps.length; i++){
			if(this._data.steps[i] == step){
				this._data.steps.splice(i, 1);
			}
		}

		this._recalculate_step_order();
		this._update_total_duration();
	}

	// Delete this sequence
	delete(){
		this.dom.remove();
	}

	// //////////////////////////////////////
	// Helper functions


	//
	// Re-calculate the total sequence length
	_update_total_duration(){
		
		this._total_duration = 0;
		for(let step of this._data.steps){
			this._total_duration += step.get_duration();
		}
	}

	// Re-calculate the index of all steps
	_recalculate_step_order(){
		let o=0;
		this.dom.querySelectorAll(".sequence_step").forEach((step_dom) => {
			let step = this._get_step_from_index(step_dom.dataset.index);
			step.set_order(o);
			o++;
		});

		// Sort array now so animation will play in correct order
		this._data.steps.sort((a, b) => (a.get_order() > b.get_order()) ? 1 : -1);
	}

	// Fires an event to trigger an update
	_fire_update(){
		this.dom.dispatchEvent(new CustomEvent("updated", {
			bubbles: true
		}));
	}

	// Hunt for a step in the list from the given index
	_get_step_from_index(index){
		for(let step of this._data.steps){
			if(step.get_index() == index){
				return step;
			}
		}
	}

	_add_event_handlers(){

		// Add some event handlers across the whole sequence
		this.dom.querySelector(".add_step").addEventListener("click", (e) => {
			e.preventDefault();
			this.step_add().get_dom().scrollIntoView({behavior: "smooth"});
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
			const this_step = e.target.parentNode.parentNode.parentNode.parentNode;

			switch(hash){
				case "step_duplicate":
					const step_clone_data = JSON.parse(JSON.stringify(this._get_step_from_index(this_step.dataset.index).get_data()));
					step_clone_data.index = ++this._index_counter;
					step_clone_data.after = this_step;
					this.step_add(step_clone_data).get_dom().scrollIntoView({behavior: "smooth"});
					this._fire_update();
					e.target.blur();
					break;
				case "step_delete":
					this.step_delete(this._get_step_from_index(this_step.dataset.index));
					this._fire_update();
					e.target.blur();
					break;
				case "minimise":
					this.dom.classList.toggle("minimised");
					e.target.blur();
					break;
			}
		});

		
		// Set handler for trigger changes
		this.dom.querySelectorAll(".button_select").forEach((select) => {
			select.addEventListener('change', (e) => {
				e.preventDefault();
				this.set_trigger(e.target.name, e.target.value);
				this._fire_update();
			});
		});

		// Set handler for name editing
		this.dom.querySelector(".name").addEventListener('keydown', (e) => {
			if(e.key === 'Enter'){
				e.preventDefault();
				e.target.blur();
				if(e.target.innerHTML != this._name){
					this.set_name(e.target.innerHTML);
					e.target.dispatchEvent(new CustomEvent("updated_name", {bubbles: true}));
					this._fire_update();
				}
			}
		});
		this.dom.querySelector(".name").addEventListener("blur", (e) => {
			e.preventDefault();
			if(e.target.innerHTML != this._name){
				this.set_name(e.target.innerHTML);
				e.target.dispatchEvent(new CustomEvent("updated_name", {bubbles: true}));
				this._fire_update();
			}
		});
	}
}

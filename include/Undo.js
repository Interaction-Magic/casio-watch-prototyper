//
// Undo / Redo handler
//

class Undo{

	// Default options are below
	_default_opts = {
		disabled_class: "disabled"
	};

	_stack = [];

	_current_index = -1;

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};

		this._update_elms();
	}

	// Save a new bookmark point
	save(data){
		if(this._current_index < (this._stack.length-1)){
			// If we aren't at the end of the stack, then wipe everything after this before saving
			this._stack.splice(this._current_index+1);
		}
		this._stack.push(JSON.parse(JSON.stringify(data))); // Deep copy of object into stack
		this._current_index++;

		this._update_elms();
	}

	// Step backwards in the stack
	undo(){
		if(this._current_index > 0){
			this._current_index--;
			return this.retrieve();
		}
		return false;
	}

	// Step forwards in the stack
	undoundo(){
		if(this._current_index < (this._stack.length-1)){
			this._current_index++;
			return this.retrieve();
		}
		return false;
	}

	// Fetch the current stack contents
	retrieve(){
		this._update_elms();
		return this._stack[this._current_index];
	}

	// Check if undo or undoundo is possible right now
	has_undo(){
		return {
			undo: (this._current_index>0) && (this._stack.length>0),
			undoundo: (this._current_index < (this._stack.length-1)) && (this._stack.length>0)
		};
	}

	// Updates the disabled class on the elements
	_update_elms(){
		const states = this.has_undo();
		if(this.opts.undo_elm){
			this.opts.undo_elm.classList.toggle(`${this.opts.disabled_class}`, !states.undo);
		}
		if(this.opts.undoundo_elm){
			this.opts.undoundo_elm.classList.toggle(`${this.opts.disabled_class}`, !states.undoundo);
		}
	}
}

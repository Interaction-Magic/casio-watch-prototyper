//
// Undo / Redo handler
//

class Undo{

	// Default options are below
	_default_opts = {
	};

	_stack = [];

	_current_index = -1;

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};
	}

	// Save a new bookmark point
	save(data){

		if(this._current_index < (this._stack.length-1)){
			// If we aren't at the end of the stack, then wipe everything after this before saving
			this._stack.splice(this._current_index+1);
		}
		this._stack.push(JSON.parse(JSON.stringify(data))); // Deep copy of object into stack
		this._current_index++;
		console.log([this._current_index, this._stack]);
	}

	// Step backwards in the stack
	undo(){
		if(this._current_index > 0){
			this._current_index--;
			console.log([this._current_index, this._stack]);
			return this.retrieve();
		}
		return false;
	}

	// Step forwards in the stack
	undoundo(){
		if(this._current_index < (this._stack.length-1)){
			this._current_index++;
			console.log([this._current_index, this._stack]);
			return this.retrieve();
		}
		return false;
	}

	// Fetch the current stack contents
	retrieve(){
		return this._stack[this._current_index];
	}
}

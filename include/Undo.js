//
// Undo / Redo handler
//

class Undo{

	// Default options are below
	_default_opts = {
	};

	_stack = [];

	_current_index = 0;

	constructor(opts) {
		// Merge opts with defaults
		this.opts = {...this._default_opts, ...opts};
	}

	save(data){

		console.log(data);

		if(this._current_index < (this._stack.length-1)){
			// If we aren't at the end of the stack, then wipe everything after this before saving
			this._stack.splice(this._current_index);
		}
		this._stack.push(data);
		this._current_index++;
	}

	undo(){
		this._current_index--;
		return this.retrieve();
	}

	undoundo(){
		if(this._current_index < (this._stack.length-1)){
			this._current_index++;
			return this.retrieve();
		}
		return false;
	}

	retrieve(){
		return this._stack[this._current_index];
	}
}

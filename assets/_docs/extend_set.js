(function() {
	Set.prototype.isSubset = function(s) {
		// true if all elements in s exist in this
		let itr = s.values(),
			matchFound = true,
			ent;
		while ((ent = itr.next()) && !ent.done && matchFound) {
			matchFound = this.has(ent.value)
		}
		return matchFound;
	}

	Set.prototype.isProperSubset = function(s) {
		// true if all elements in s exist in this and s is not equal to this
		return this.isSubset(s) && this.size !== s.size;
	}

	Set.prototype.isDisjoint = function(s) {
		// returns true if no elements in s exist in this
		let itr = s.values(),
			matchFound = false,
			ent;
		while ((ent = itr.next()) && !ent.done && !matchFound) {
			matchFound = this.has(ent.value)
		}
		return !matchFound;
	}

	Set.prototype.union = function(s) {
		// returns new set containing all members of both this and s
		return new Set([...this, ...s]);
	}

	Set.prototype.intersection = function(s) {
		// returns new set containing all members that exist in both this and s
		let t = new Set();
		this.forEach(val => {
			if (s.has(val)) t.add(val);
		})

		return t;
	}

	Set.prototype.difference = function(s) {
		// returns new set containing all members of this that are not members of s
		let t = new Set();
		this.forEach(val => {
			if (!s.has(val)) t.add(val);
		})

		return t;
	}

	Set.prototype.symmetricDifference = function(s) {
		// returns a set containing all members of this not in s and all members of s not in this 
		return this.difference(s).union(s.difference(this));
	}

	Set.prototype.cartesianProduct = function(s) {
		// returns set containing arrays of all possible pairs of elemnts in this and s
		let t = new Set();
		this.forEach(thisVal => {
			s.forEach(sVal => {
				t.add([thisVal, sVal]);
			});
		})
		return t;
	}

	Set.prototype.subsetsOfSize = function(size) {
		// returns new set containing arrays all possible subsets of size "size"
		// based on: https://gist.github.com/axelpale/3118596

		if (size > this.size || size <= 0) return new Set([
			[]
		]);

		let elements = [...this];
		if (size === 1) return new Set(elements.map(v => [v]));
		if (size === this.size) return new Set([elements])

		let t = new Set();
		for (let i = 0; i < elements.length - size + 1; i++) {
			let head = elements.slice(i, i + 1);
			let tailSet = new Set(elements.slice(i + 1));
			tailSet.subsetsOfSize(size - 1).forEach(v => {
				t.add(head.concat(v));
			})
		}

		return t;
	}

	Set.prototype.powerSet = function() {
		// returns a new set containing arrays of all possible subsets of this
		// Warning: this becomes very slow for sets over the size of 20 elements.
		// A set with 20 elements will have 1048576 subsets. This grows exponentially
		// with larger sets.
		// Based on: https://stackoverflow.com/a/47147597

		return new Set([...this].reduce((subsets, val) => {
			return subsets.concat(
				subsets.map(set => [val, ...set])
			)
		}, [
			[]
		]));
	}
})();
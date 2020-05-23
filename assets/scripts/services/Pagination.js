import Utils from './Utils.js'

const Pagination = (function() {
    let self = {};
    let current = 1;
    let last = '';
    let a = [];
    let b = [];

    self.init = function() {
        a = [];
        b = [];
    };
	
    self.initialPagination = function(lastPage) {
        self.init();
        last = lastPage;
        for (let i = 1; i <= last; i++) {
            a.push(i);
        }
        b = (last <= 4) ? a : self.getUpdatedPageList(parseInt(current));
        return b;
    };

    self.getUpdatedPageList = function(current) {
        if (last <= 4) {
            return b;
        }
        self.init();
        if (current == 1 || current == 2 || current == last - 1 || current == last) {
            if (current == 1 || current == 2) {
                b = [1, 2, 3, '...'];
                if (last > 4) {
                    b.push(last);
                } else {
                    b[3] = 4;
                }
            } else {
                b = ['...', last - 2, last - 1, last];
                if (last - 3 > 1) {
                    b.unshift(1);
                } else {
                    b[0] = 1;
                }
            }
        } else {
            b = ['...', current - 1, current, current + 1, '...'];
            if (last > current + 2) {
                b.push(last);
            } else {
                b[4] = last;
            }
            if (current - 2 > 1) {
                b.unshift(1);
            } else {
                b[0] = 1;
            }
        }
	    
	    let pre = current === 1 ? [] : ['&laquo;'];
	    let pos = current === last ? [] : ['&raquo;'];
	    b = pre.concat(b, pos);
	    pre = pos = undefined;
	    return b;
    };
    return self;
})();

export default Pagination;

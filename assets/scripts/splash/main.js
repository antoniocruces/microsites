function changeimage() {
	document.querySelectorAll('.slides').forEach(o => {
		if(o.id === `bkg${current}`) {
			o.style.display = 'block';
		} else {
			o.style.display = 'none';
		}
	});
	current = current === document.querySelectorAll('.slides').length - 1 ? 0 : current + 1;
}

let current = 0;
let imagechanger = document.getElementById('bkg');
let imagetimer = setInterval(changeimage, 10000);
changeimage();

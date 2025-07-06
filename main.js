let darkmode = localStorage.getItem('darkmode')
const themeSwitcher = document.getElementById('theme-switcher')

function enableDarkmode() {
	document.body.classList.add('darkmode')
	localStorage.setItem('darkmode', 'active')
}

function disableDarkmode() {
	document.body.classList.remove('darkmode')
	localStorage.setItem('darkmode', null)
}

if (darkmode === 'active') enableDarkmode()

themeSwitcher.addEventListener('click', function() {
	let darkmode = localStorage.getItem('darkmode')
	if (darkmode !== 'active') {
		enableDarkmode()
	} else {
		disableDarkmode()
	}
})
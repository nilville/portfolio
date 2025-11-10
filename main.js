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

const contactForm = document.getElementById('contact-form')

contactForm.addEventListener('submit', function(e) {
	e.preventDefault()
	
	const email = document.getElementById('email').value
	const subject = document.getElementById('subject').value
	const body = document.getElementById('body').value
	
	if (!email || !subject || !body) {
		alert('Please fill in all fields')
		return
	}
	
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		alert('Please enter a valid email address')
		return
	}
	
	console.log('Form submitted:', { email, subject, body })
	
	alert('Message sent successfully! (Note: This is a demo. Configure backend to actually send emails)')
	
	contactForm.reset()
})
const themeSwitcher = document.getElementById('theme-switcher')

// Theme Management
const toggleTheme = (isLight) => {
	document.body.classList.toggle('light-theme', isLight)
	localStorage.setItem('terminal_theme', isLight ? 'light' : 'dark')
}

// Initialize Theme
const savedTheme = localStorage.getItem('terminal_theme')
if (savedTheme === 'light') toggleTheme(true)

themeSwitcher.addEventListener('click', () => {
	const isCurrentlyLight = document.body.classList.contains('light-theme')
	toggleTheme(!isCurrentlyLight)
})

// Form Handling with Terminal Feedback
const contactForm = document.getElementById('contact-form')

contactForm.addEventListener('submit', function(e) {
	e.preventDefault()
	
	const email = document.getElementById('email').value
	const subject = document.getElementById('subject').value
	const body = document.getElementById('body').value
	
	if (!email || !subject || !body) {
		console.error('CRITICAL_ERROR: Missing required payloads')
		return
	}
	
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		alert('ERROR: Invalid protocol in email address')
		return
	}
	
	// Simulated Terminal Output
	console.log('INITIATING_CONNECTION...')
	console.log(`HEADER: ${subject}`)
	console.log('ENCRYPTING_PAYLOAD...')
	console.log('TRANSMISSION_SUCCESSFUL')
	
	alert('>>> MSG_SENT: Connection established. (Demo mode active)')
	
	contactForm.reset()
})
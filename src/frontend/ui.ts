import { SlInput, SlButton } from '@shoelace-style/shoelace';

// * Wait for the document to be ready
document.addEventListener('DOMContentLoaded', () => {
	const uploadTokenElm = document.querySelector('#upload-token') as SlInput;
	const submitButtonElm = document.querySelector('#submit') as SlButton;

	// * Setup button click handler
	submitButtonElm.addEventListener('click', async () => {

		// Disable button
		submitButtonElm.disabled = true;

		// Get values
		const uploadToken = uploadTokenElm.value;

		// Check if values are valid
		if (!uploadToken || uploadToken.length === 0) {
			alert('Please enter a valid Upload Token');
			submitButtonElm.disabled = false;
			return;
		}

		// Save values to KV
		fetch('/setup', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ UPLOAD_TOKEN: uploadToken })
		})
			.then((res) => {
				if (!res.ok) throw new Error('Invalid credentials');
				return res.text();
			})

			// Setup complete
			.then((msg) => (alert(msg), window.location.href = '/'))

			// Error, reset button
			.catch((err) => (alert(err), submitButtonElm.disabled = false));
	});
});

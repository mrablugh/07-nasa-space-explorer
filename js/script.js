// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const getImagesButton = document.querySelector('.filters button');
const apiKey = 'CZHuD7GrIgsvDyOii2Egfzjr5SLRoGEUuxda4Mb4';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

function showMessage(message) {
	gallery.innerHTML = `
		<div class="placeholder">
			<div class="placeholder-icon">🔭</div>
			<p>${message}</p>
		</div>
	`;
}

function createGalleryItem(item) {
	const card = document.createElement('article');
	card.className = 'gallery-item';

	if (item.media_type === 'image') {
		card.innerHTML = `
			<img src="${item.url}" alt="${item.title}" />
			<p><strong>${item.title}</strong></p>
			<p>${item.date}</p>
			<p>${item.explanation}</p>
		`;
	} else {
		card.innerHTML = `
			<iframe
				src="${item.url}"
				title="${item.title}"
				allowfullscreen
				loading="lazy"
			></iframe>
			<p><strong>${item.title}</strong></p>
			<p>${item.date}</p>
			<p>${item.explanation}</p>
		`;
	}

	return card;
}

async function loadSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;

	if (!startDate || !endDate) {
		showMessage('Please choose a start date and an end date.');
		return;
	}

	if (startDate > endDate) {
		showMessage('The start date must be before the end date.');
		return;
	}

	gallery.innerHTML = '<div class="placeholder"><p>Loading space images...</p></div>';

	try {
		const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('NASA API request failed.');
		}

		const data = await response.json();

    console.log('NASA API response:', data); // Log the response for debugging

		gallery.innerHTML = '';

		if (!Array.isArray(data) || data.length === 0) {
			showMessage('No space images were found for that date range.');
			return;
		}

		data.forEach((item) => {
			gallery.appendChild(createGalleryItem(item));
		});
	} catch (error) {
		showMessage('Sorry, we could not load the NASA images right now.');
	}
}

getImagesButton.addEventListener('click', loadSpaceImages);

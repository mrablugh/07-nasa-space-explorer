// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const getImagesButton = document.querySelector('.filters button');
const modal = document.createElement('div');
modal.className = 'modal hidden';
modal.innerHTML = `
	<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
		<button class="modal-close" type="button" aria-label="Close modal">&times;</button>
		<div class="modal-media"></div>
		<h2 id="modalTitle"></h2>
		<p class="modal-date"></p>
		<p class="modal-explanation"></p>
	</div>
`;
document.body.appendChild(modal);
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
	card.setAttribute('role', 'button');
	card.setAttribute('tabindex', '0');
	card.dataset.title = item.title;
	card.dataset.date = item.date;
	card.dataset.explanation = item.explanation;
	card.dataset.mediaType = item.media_type;
	card.dataset.url = item.url;

	if (item.media_type === 'image') {
		card.innerHTML = `
			<img src="${item.url}" alt="${item.title}" />
			<p class="gallery-title"><strong>${item.title}</strong></p>
			<p class="gallery-date">${item.date}</p>
		`;
	} else {
		card.innerHTML = `
			<iframe
				src="${item.url}"
				title="${item.title}"
				allowfullscreen
				loading="lazy"
			></iframe>
			<p class="gallery-title"><strong>${item.title}</strong></p>
			<p class="gallery-date">${item.date}</p>
		`;
	}

	card.addEventListener('click', () => openModal(item));
	card.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openModal(item);
		}
	});

	return card;
}

function openModal(item) {
	const modalMedia = modal.querySelector('.modal-media');
	const modalTitle = modal.querySelector('#modalTitle');
	const modalDate = modal.querySelector('.modal-date');
	const modalExplanation = modal.querySelector('.modal-explanation');

	modalTitle.textContent = item.title;
	modalDate.textContent = item.date;
	modalExplanation.textContent = item.explanation;

	if (item.media_type === 'image') {
		modalMedia.innerHTML = `<img src="${item.url}" alt="${item.title}" />`;
	} else {
		modalMedia.innerHTML = `
			<iframe
				src="${item.url}"
				title="${item.title}"
				allowfullscreen
				loading="lazy"
			></iframe>
		`;
	}

	modal.classList.remove('hidden');
	document.body.classList.add('modal-open');
	modal.querySelector('.modal-close').focus();
}

function closeModal() {
	modal.classList.add('hidden');
	document.body.classList.remove('modal-open');
	modal.querySelector('.modal-media').innerHTML = '';
}

modal.addEventListener('click', (event) => {
	if (event.target === modal || event.target.classList.contains('modal-close')) {
		closeModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
		closeModal();
	}
});

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

	gallery.innerHTML = '<div class="placeholder"><p>🔄 Loading space images...</p></div>';

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

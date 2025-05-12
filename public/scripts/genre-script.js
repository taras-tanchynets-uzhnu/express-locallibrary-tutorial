let editGenreId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchGenres();
  createModal();
});

// Fetch all genres from the server
async function fetchGenres() {
  try {
    const response = await fetch('http://localhost:3000/catalog/genres/', {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    });

    const data = await response.json();

    if (data && data.genre_list) {
      displayGenres(data.genre_list);
    } else {
      showError('No genres found');
    }
  } catch (error) {
    showError('Error fetching genres');
  }
}


function displayGenres(genres) {
  const genreContainer = document.getElementById('genreContainer');
  genreContainer.innerHTML = '';

  genres.forEach(genre => {
    const genreElement = document.createElement('div');
    genreElement.classList.add('genre');

    const textContent = document.createElement('div');
    textContent.classList.add('text-content');
    textContent.textContent = genre.name;
    genreElement.appendChild(textContent);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => openEditModal(genre));
    buttonGroup.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteGenre(genre._id));
    buttonGroup.appendChild(deleteButton);

    genreElement.appendChild(buttonGroup);
    genreContainer.appendChild(genreElement);
  });
}



// Handle genre deletion
async function deleteGenre(id) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/genres/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    fetchGenres();
  } catch (error) {
    showError(error.message);
  }
}

async function createGenre(name) {
  try {
    const response = await fetch('http://localhost:3000/catalog/genres', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      throw new Error('Error creating genre');
    }

    await response.json();
    fetchGenres();
  } catch (error) {
    console.error('Error:', error);
    showError(error.message);
  }
}

async function updateGenre(id, name) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/genres/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      throw new Error('Error updating genre');
    }

    fetchGenres();
  } catch (error) {
    console.error(error);
    showError('Error updating genre');
  }
}

function openEditModal(genre) {
  const modal = document.getElementById('genreCreationModal');
  modal.style.display = 'block';
  document.getElementById('submitGenreButton').textContent = 'Edit';

  document.getElementById('nameInput').value = genre.name;
  editGenreId = genre._id;
}

function createModal() {
  const modal = document.createElement('div');
  modal.id = 'genreCreationModal';

  const modalContent = document.createElement('div');
  modalContent.id = 'modalContent';

  const closeButton = document.createElement('span');
  closeButton.id = 'closeButton';
  closeButton.textContent = 'x';
  closeButton.onclick = () => {
    modal.style.display = 'none';
  };

  const form = document.createElement('form');
  form.classList.add('modal-form');
  form.id = 'genreCreationForm';

  form.innerHTML = `
    <label>Genre Name:</label>
    <input type="text" name="name" id="nameInput" />
  `;

  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('button-group');

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.classList.add('modal-button', 'cancel');
  cancelButton.textContent = 'Cancel';
  cancelButton.onclick = () => {
    modal.style.display = 'none';
  };

  const createButton = document.createElement('button');
  createButton.type = 'submit';
  createButton.id = 'submitGenreButton';
  createButton.classList.add('modal-button');
  createButton.textContent = 'Create';

  createButton.onclick = (event) => {
    event.preventDefault();

    const name = document.getElementById('nameInput').value;

    if (editGenreId) {
      updateGenre(editGenreId, name);
      editGenreId = null;
    } else {
      createGenre(name);
    }

    modal.style.display = 'none';
  };

  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(createButton);

  modalContent.appendChild(closeButton);
  modalContent.appendChild(form);
  modalContent.appendChild(buttonGroup);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  document.getElementById('createGenreButton').addEventListener('click', () => {
    modal.style.display = 'block';
    editGenreId = null;

    document.getElementById('nameInput').value = '';
    document.getElementById('submitGenreButton').textContent = 'Create';
  });
}


// Display error messages
function showError(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;

  document.body.appendChild(toast);
  toast.classList.add('show');

  const hideToast = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  };

  setTimeout(hideToast, 15000);
  toast.addEventListener('click', hideToast);
}
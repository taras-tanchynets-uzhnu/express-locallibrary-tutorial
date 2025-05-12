let editAuthorId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchAuthors();
  createModal();
});

async function fetchAuthors() {
  try {
    const response = await fetch('http://localhost:3000/catalog/authors', {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    });


    const data = await response.json();

    if (data && data.author_list) {
      displayAuthors(data.author_list);
    } else {
      showError('No authors found');
    }
  } catch (error) {
    showError('Error fetching authors');
  }
}

function displayAuthors(authors) {
  const container = document.getElementById('authorContainer');
  container.innerHTML = '';

  authors.forEach(author => {
    const element = document.createElement('div');
    element.classList.add('author');

    const textContent = document.createElement('div');
    textContent.classList.add('text-content');
    textContent.textContent = `${author.first_name} ${author.family_name}`;
    element.appendChild(textContent);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => openEditModal(author));
    buttonGroup.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteAuthor(author._id));
    buttonGroup.appendChild(deleteButton);

    element.appendChild(buttonGroup);
    container.appendChild(element);
  });
}


async function deleteAuthor(id) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/authors/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Cannot delete author');
    }

    fetchAuthors();
  } catch (error) {
    showError(error.message);
  }
}

async function createAuthor(first_name, family_name, date_of_birth, date_of_death) {
  try {
    const response = await fetch('http://localhost:3000/catalog/authors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ first_name, family_name, date_of_birth, date_of_death })
    });

    if (!response.ok) {
      throw new Error('Error creating author');
    }

    await response.json();
    fetchAuthors();
  } catch (error) {
    showError(error.message);
  }
}

async function updateAuthor(id, first_name, family_name, date_of_birth, date_of_death) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/authors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ first_name, family_name, date_of_birth, date_of_death })
    });

    if (!response.ok) {
      throw new Error('Error updating author');
    }

    fetchAuthors();
  } catch (error) {
    showError(error.message);
  }
}

function openEditModal(author) {
  const modal = document.getElementById('authorCreationModal');
  modal.style.display = 'block';
  document.getElementById('submitAuthorButton').textContent = 'Edit';

  document.getElementById('firstNameInput').value = author.first_name;
  document.getElementById('familyNameInput').value = author.family_name;
  document.getElementById('dobInput').value = author.date_of_birth?.slice(0, 10) || '';
  document.getElementById('dodInput').value = author.date_of_death?.slice(0, 10) || '';
  editAuthorId = author._id;
}

function createModal() {
  const modal = document.createElement('div');
  modal.id = 'authorCreationModal';

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
  form.id = 'authorCreationForm';

  form.innerHTML = `
    <label>First Name:</label>
    <input type="text" id="firstNameInput" />

    <label>Family Name:</label>
    <input type="text" id="familyNameInput" />

    <label>Date of Birth:</label>
    <input type="date" id="dobInput" />

    <label>Date of Death:</label>
    <input type="date" id="dodInput" />
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

  const submitButton = document.createElement('button');
  submitButton.type = 'submit';
  submitButton.id = 'submitAuthorButton';
  submitButton.classList.add('modal-button');
  submitButton.textContent = 'Create';

  submitButton.onclick = (event) => {
    event.preventDefault();

    const first_name = document.getElementById('firstNameInput').value;
    const family_name = document.getElementById('familyNameInput').value;
    const date_of_birth = document.getElementById('dobInput').value || null;
    const date_of_death = document.getElementById('dodInput').value || null;

    if (editAuthorId) {
      updateAuthor(editAuthorId, first_name, family_name, date_of_birth, date_of_death);
      editAuthorId = null;
    } else {
      createAuthor(first_name, family_name, date_of_birth, date_of_death);
    }

    modal.style.display = 'none';
  };

  buttonGroup.appendChild(cancelButton);
  buttonGroup.appendChild(submitButton);

  modalContent.appendChild(closeButton);
  modalContent.appendChild(form);
  modalContent.appendChild(buttonGroup);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  document.getElementById('createAuthorButton').addEventListener('click', () => {
    modal.style.display = 'block';
    editAuthorId = null;

    document.getElementById('firstNameInput').value = '';
    document.getElementById('familyNameInput').value = '';
    document.getElementById('dobInput').value = '';
    document.getElementById('dodInput').value = '';

    document.getElementById('submitAuthorButton').textContent = 'Create';
  });
}

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
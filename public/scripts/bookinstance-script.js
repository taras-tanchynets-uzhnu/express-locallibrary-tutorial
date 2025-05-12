let editBookInstanceId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchBookInstances();
  createModal();
});

async function fetchBookInstances() {
  try {
    const response = await fetch('http://localhost:3000/catalog/bookinstances/', {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();
    if (data && data.bookinstance_list) {
      displayBookInstances(data.bookinstance_list);
    } else {
      showError('No book instances found');
    }
  } catch (error) {
    showError('Error fetching book instances');
  }
}

function displayBookInstances(bookInstances) {
  const bookInstanceContainer = document.getElementById('bookInstanceContainer');
  bookInstanceContainer.innerHTML = '';

  bookInstances.forEach(bookInstance => {
    const bookInstanceElement = document.createElement('div');
    bookInstanceElement.classList.add('book-instance');

    const textContent = document.createElement('div');
    textContent.classList.add('text-content');
    textContent.innerHTML = `
      <div class="book-instance-title">${bookInstance.book?.title || 'Untitled Book'}</div>
      <div class="book-instance-imprint">${bookInstance.imprint}</div>
      <div class="book-instance-status">${bookInstance.status}</div>
      <div class="book-instance-due-back">${bookInstance.due_back ? new Date(bookInstance.due_back).toDateString() : 'N/A'}</div>
    `;
    bookInstanceElement.appendChild(textContent);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => openEditModal(bookInstance));
    buttonGroup.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteBookInstance(bookInstance._id));
    buttonGroup.appendChild(deleteButton);

    bookInstanceElement.appendChild(buttonGroup);
    bookInstanceContainer.appendChild(bookInstanceElement);
  });
}

async function deleteBookInstance(id) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/bookinstances/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }

    fetchBookInstances();
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

async function updateBookInstance(id, book, imprint, status, due_back) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/bookinstances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, imprint, status, due_back })
    });

    if (!response.ok) throw new Error('Error updating book instance');

    fetchBookInstances();
  } catch (error) {
    console.error(error);
    showError('Error updating book instance');
  }
}

async function openEditModal(bookInstance) {
  const modal = document.getElementById('bookInstanceCreationModal');
  const bookSelect = document.getElementById('bookSelect');

  bookSelect.innerHTML = '';

  try {
    const response = await fetch('http://localhost:3000/catalog/bookinstancescreateform', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Error fetching books');

    const data = await response.json();
    const books = data.books;

    books.forEach(book => {
      const option = document.createElement('option');
      option.value = book._id;
      option.textContent = book.title;
      if (
        book._id === bookInstance.book?._id ||
        book._id === bookInstance.book
      ) {
        option.selected = true;
      }
      bookSelect.appendChild(option);
    });
  } catch (error) {
    console.error(error);
    showError('Error loading books');
    return;
  }

  document.getElementById('imprintInput').value = bookInstance.imprint;
  document.getElementById('statusInput').value = bookInstance.status;
  document.getElementById('dueBackInput').value = bookInstance.due_back
    ? new Date(bookInstance.due_back).toISOString().split('T')[0]
    : '';

  document.getElementById('submitBookInstanceButton').textContent = 'Edit';
  editBookInstanceId = bookInstance._id;
  modal.style.display = 'block';
}


function createModal() {
  const modal = document.createElement('div');
  modal.id = 'bookInstanceCreationModal';

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
  form.id = 'bookInstanceCreationForm';

  form.innerHTML = `
    <label>Book:</label>
    <select id="bookSelect"></select>

    <label>Imprint:</label>
    <input type="text" name="imprint" id="imprintInput" />

    <label>Status:</label>
    <select name="status" id="statusInput">
      <option value="Available">Available</option>
      <option value="Maintenance">Maintenance</option>
      <option value="Loaned">Loaned</option>
      <option value="Reserved">Reserved</option>
    </select>

    <label>Due Back:</label>
    <input type="date" name="due_back" id="dueBackInput" />
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
  createButton.id = 'submitBookInstanceButton';
  createButton.classList.add('modal-button');
  createButton.textContent = 'Create';

  createButton.onclick = async (event) => {
    event.preventDefault();

    const book = document.getElementById('bookSelect').value;
    const imprint = document.getElementById('imprintInput').value;
    const status = document.getElementById('statusInput').value;
    const due_back = document.getElementById('dueBackInput').value;

    if (!book) {
      showError('Please select a book.');
      return;
    }

    if (editBookInstanceId) {
      await updateBookInstance(editBookInstanceId, book, imprint, status, due_back);
      editBookInstanceId = null;
    } else {
      await createBookInstance(book, imprint, status, due_back);
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

  document.getElementById('createBookInstanceButton').addEventListener('click', async () => {
    modal.style.display = 'block';
    editBookInstanceId = null;

    document.getElementById('imprintInput').value = '';
    document.getElementById('statusInput').value = '';
    document.getElementById('dueBackInput').value = '';

    await fetchFormData();

    document.getElementById('submitBookInstanceButton').textContent = 'Create';
  });
}

async function fetchFormData() {
  try {
    const response = await fetch('http://localhost:3000/catalog/bookinstancescreateform', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error('Error fetching form data');

    const data = await response.json();
    populateForm(data);
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

function populateForm(data) {
  const select = document.getElementById('bookSelect');
  select.innerHTML = '';

  data.books.forEach(book => {
    const option = document.createElement('option');
    option.value = book._id;
    option.textContent = book.title;
    select.appendChild(option);
  });
}

async function createBookInstance(book, imprint, status, due_back) {
  try {
    const response = await fetch('http://localhost:3000/catalog/bookinstances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, imprint, status, due_back })
    });

    if (!response.ok) throw new Error('Error creating book instance');

    fetchBookInstances();
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
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
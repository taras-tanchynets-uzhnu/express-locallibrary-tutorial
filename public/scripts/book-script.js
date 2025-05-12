let editBookId = null;

document.addEventListener('DOMContentLoaded', () => {
  fetchBooks();
  createModal();
});

async function fetchBooks() {
  try {
    const response = await fetch('http://localhost:3000/catalog/books/', {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    });

    const data = await response.json();

    if (data && data.book_list) {
      displayBooks(data.book_list);
    } else {
      showError('No books found');
    }
  } catch (error) {
    showError('Error fetching books');
  }
}

function displayBooks(books) {
  const bookContainer = document.getElementById('bookContainer');
  bookContainer.innerHTML = '';

  books.forEach(book => {
    const bookElement = document.createElement('div');
    bookElement.classList.add('book');

    const textContent = document.createElement('div');
    textContent.classList.add('text-content');
    textContent.innerHTML = `
      <div class="book-title">${book.title}</div>
      <div class="book-authors">${book.author.first_name} ${book.author.family_name}</div>
    `;
    bookElement.appendChild(textContent);

    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('button-group');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => openEditModal(book));
    buttonGroup.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteBook(book._id));
    buttonGroup.appendChild(deleteButton);

    bookElement.appendChild(buttonGroup);
    bookContainer.appendChild(bookElement);
  });
}

async function deleteBook(id) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/books/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    fetchBooks();
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

async function createBook(title, authorId, summary, isbn, genreIds) {
  try {
    const response = await fetch('http://localhost:3000/catalog/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        author: authorId,
        summary,
        isbn,
        genre: genreIds
      })
    });

    if (!response.ok) {
      throw new Error('Error creating book');
    }

    await response.json();
    fetchBooks();
  } catch (error) {
    console.error('Error:', error);
    showError(error.message);
  }
}

async function updateBook(id, title, authorId, summary, isbn, genreIds) {
  try {
    const response = await fetch(`http://localhost:3000/catalog/books/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        author: authorId,
        summary,
        isbn,
        genre: genreIds
      })
    });

    if (!response.ok) {
      throw new Error('Error updating book');
    }

    fetchBooks();
  } catch (error) {
    console.error(error);
    showError('Error updating book');
  }
}

function openEditModal(book) {
  const modal = document.getElementById('bookCreationModal');
  modal.style.display = 'block';
  document.getElementById('submitBookButton').textContent = 'Edit';

  document.getElementById('titleInput').value = book.title;
  document.getElementById('summaryTextarea').value = book.summary;
  document.getElementById('isbnInput').value = book.isbn;
  editBookId = book._id;

  fetch('http://localhost:3000/catalog/bookscreateform')
    .then(response => response.json())
    .then(data => {
      populateForm(data.authors, data.genres);
      setTimeout(() => {
        document.getElementById('authorSelect').value = book.author._id;
        const genreCheckboxes = document.querySelectorAll('#genreCheckboxes input[type="checkbox"]');
        genreCheckboxes.forEach(checkbox => {
          checkbox.checked = book.genre.some(g => g._id === checkbox.value);
        });
      }, 100);
    });
}

async function fetchFormData() {
  try {
    const response = await fetch('http://localhost:3000/catalog/bookscreateform', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error fetching form data');
    }

    const data = await response.json();
    populateForm(data.authors, data.genres);
  } catch (error) {
    console.error(error);
    showError(error.message);
  }
}

function populateForm(authors, genres) {
  const authorSelect = document.getElementById('authorSelect');
  const genreCheckboxes = document.getElementById('genreCheckboxes');
  authorSelect.innerHTML = '';
  genreCheckboxes.innerHTML = '';

  authors.forEach(author => {
    const option = document.createElement('option');
    option.value = author._id;
    option.textContent = `${author.first_name} ${author.family_name}`;
    authorSelect.appendChild(option);
  });

  genres.forEach(genre => {
    const label = document.createElement('label');
    label.classList.add('checkbox-label'); // Додано клас для стилізації

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = genre._id;
    checkbox.name = 'genre';

    label.appendChild(checkbox);

    const span = document.createElement('span');
    span.textContent = genre.name;
    label.appendChild(span);

    document.getElementById('genreCheckboxes').appendChild(label);
  });
}

function createModal() {
  const modal = document.createElement('div');
  modal.id = 'bookCreationModal';

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
  form.id = 'bookCreationForm';

  form.innerHTML = `
    <label>Title:</label>
    <input type="text" name="title" id="titleInput" />
    <label>Author:</label>
    <select name="author" id="authorSelect"></select>
    <label>Summary:</label>
    <textarea name="summary" id="summaryTextarea"></textarea>
    <label>ISBN:</label>
    <input type="text" name="isbn" id="isbnInput" />
    <label>Genres:</label>
    <div id="genreCheckboxes"></div>
  `;

  const buttonsDiv = document.createElement('div');
  buttonsDiv.classList.add('button-group');

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';
  cancelButton.classList.add('modal-button', 'cancel');
  cancelButton.onclick = () => {
    modal.style.display = 'none';
  };

  const createButton = document.createElement('button');
  createButton.type = 'submit';
  createButton.id = 'submitBookButton';
  createButton.textContent = 'Create';
  createButton.classList.add('modal-button');

  createButton.onclick = (event) => {
    event.preventDefault();

    const title = document.getElementById('titleInput').value;
    const authorId = document.getElementById('authorSelect').value;
    const summary = document.getElementById('summaryTextarea').value;
    const isbn = document.getElementById('isbnInput').value;
    const genreCheckboxes = document.querySelectorAll('#genreCheckboxes input[type="checkbox"]:checked');
    const genreIds = Array.from(genreCheckboxes).map(cb => cb.value);

    if (editBookId) {
      updateBook(editBookId, title, authorId, summary, isbn, genreIds);
      editBookId = null;
    } else {
      createBook(title, authorId, summary, isbn, genreIds);
    }

    modal.style.display = 'none';
  };

  buttonsDiv.appendChild(cancelButton);
  buttonsDiv.appendChild(createButton);
  modalContent.appendChild(closeButton);
  modalContent.appendChild(form);
  modalContent.appendChild(buttonsDiv);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);


  document.getElementById('createBookButton').addEventListener('click', () => {
    modal.style.display = 'block';
    editBookId = null;

    document.getElementById('titleInput').value = '';
    document.getElementById('summaryTextarea').value = '';
    document.getElementById('isbnInput').value = '';
    fetchFormData();

    setTimeout(() => {
      const checkboxes = document.querySelectorAll('#genreCheckboxes input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = false);
    }, 100);

    document.getElementById('submitBookButton').textContent = 'Create';
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
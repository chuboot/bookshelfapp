//document pertama kali diload
const books = [];
const RENDER_EVENT = "render-book";
const SEARCH_EVENT = "search-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.querySelector("#inputBook");
  const searchForm = document.querySelector("#searchBook");
  submitForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }

  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    searchBook();
  });
});

function searchBook() {
  document.dispatchEvent(new Event(SEARCH_EVENT));
}

function addBook() {
  const titleBook = document.querySelector("#inputBookTitle").value;
  const authorBook = document.querySelector("#inputBookAuthor").value;
  const yearBook = document.querySelector("#inputBookYear").value;
  const statusBook =
    document.querySelector("#inputBookIsComplete:checked") !== null;

  const generateID = generateId();
  const bookObject = generateBookObject(
    generateID,
    titleBook,
    authorBook,
    yearBook,
    statusBook
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const statusButton = document.createElement("button");
  statusButton.classList.add("green");
  if (bookObject.isComplete) {
    statusButton.innerText = "Belum Selesai dibaca";
    statusButton.addEventListener("click", function () {
      moveToUncompleteRead(bookObject.id);
    });
  } else {
    statusButton.innerText = "Selesai dibaca";
    statusButton.addEventListener("click", function () {
      moveToCompleteRead(bookObject.id);
    });
  }
  const removeButton = document.createElement("button");
  removeButton.innerText = "Hapus buku";
  removeButton.classList.add("red");

  removeButton.addEventListener("click", function () {
    removeBookFromShelf(bookObject.id);
  });

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");
  actionContainer.append(statusButton, removeButton);

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textTitle, textAuthor, textYear, actionContainer);
  container.setAttribute("id", `book-${bookObject.id}`);
  return container;
}

function removeBookFromShelf(bookId) {
  const bookTarget = findBookIndex(bookId);

  //modal
  let result = confirm("Apakah Anda yakin untuk menghapus?");
  if (result) {
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function moveToUncompleteRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function moveToCompleteRead(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  // console.log(localStorage.getItem(STORAGE_KEY));
  alert("Data berhasil disimpan!");
});

document.addEventListener(RENDER_EVENT, function () {
  // console.log(books);
  const uncompleteBookRead = document.querySelector("#incompleteBookshelfList");
  uncompleteBookRead.innerHTML = "";

  const completeBookRead = document.querySelector("#completeBookshelfList");
  completeBookRead.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);

    if (!bookItem.isComplete) {
      uncompleteBookRead.append(bookElement);
    } else {
      completeBookRead.append(bookElement);
    }
  }
});
document.addEventListener(SEARCH_EVENT, function () {
  // console.log(books);
  const uncompleteBookRead = document.querySelector("#incompleteBookshelfList");
  uncompleteBookRead.innerHTML = "";

  const completeBookRead = document.querySelector("#completeBookshelfList");
  completeBookRead.innerHTML = "";

  const titleSearch = document
    .querySelector("#searchBookTitle")
    .value.toLowerCase();

  for (const book of books) {
    const itemBook = book.title;
    if (itemBook.toLowerCase().includes(titleSearch)) {
      const bookElement = makeBook(book);

      if (!book.isComplete) {
        uncompleteBookRead.append(bookElement);
      } else {
        completeBookRead.append(bookElement);
      }
    }
  }
});

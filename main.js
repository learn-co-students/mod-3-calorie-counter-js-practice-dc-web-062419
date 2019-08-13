document.addEventListener('DOMContentLoaded', async () => {
  fetchCalorieEntries().then(entries => {
    renderCalorieEntries(entries);
    setProgressValue();
  });
  document
    .querySelector('#new-calorie-form')
    .addEventListener('submit', newEntry);
  document
    .querySelector('#bmr-calulator')
    .addEventListener('submit', renderBmr);
});

async function fetchCalorieEntries() {
  const res = await fetch(`http://localhost:3000/api/v1/calorie_entries`);
  const data = await res.json();
  return data;
}

function renderCalorieEntries(entries) {
  entries.forEach(entry => {
    renderCalorieEntry(entry);
  });
}

function creatCalorieEntry(entry) {
  const entryLi = document.createElement('li');
  entryLi.classList.add('calories-list-item');
  entryLi.id = `entry-${entry.id}`;
  entryLi.innerHTML = `
    <div class="uk-grid">
      <div class="uk-width-1-6">
        <strong>${entry.calorie}</strong>
        <span>kcal</span>
      </div>
      <div class="uk-width-4-5">
        <em class="uk-text-meta">${entry.note}</em>
      </div>
    </div>
    <div class="list-item-menu">
      <a
        class="edit-button"
        uk-icon="icon: pencil"
        uk-toggle="target: #edit-form-container"
        data-entry-id=${entry.id}
      ></a>
      <a
        class="delete-button"
        uk-icon="icon: trash"
        data-entry-id=${entry.id}
      ></a>
    </div>
  `;
  const deleteButton = entryLi.querySelector('.delete-button');
  const editButton = entryLi.querySelector('.edit-button');

  deleteButton.addEventListener('click', deleteEntry);
  editButton.addEventListener('click', editEntry);
  return entryLi;
}

function renderCalorieEntry(entry) {
  const entryUl = document.querySelector('#calories-list');
  entryUl.appendChild(creatCalorieEntry(entry));
}

function newEntry(e) {
  e.preventDefault();
  fetch(`http://localhost:3000/api/v1/calorie_entries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      api_v1_calorie_entry: {
        calorie: e.target[0].value,
        note: e.target[1].value,
      },
    }),
  })
    .then(res => res.json())
    .then(entry => {
      renderCalorieEntry(entry);
      setProgressValue();
    });
}

function editEntry(e) {
  const editForm = document.querySelector('#edit-calorie-form');
  const entryId = e.currentTarget.dataset.entryId;
  const entryLi = document.querySelector(`#entry-${entryId}`);
  const calories = parseInt(entryLi.querySelector('strong').innerText, 10);
  const note = entryLi.querySelector('em').innerText;
  editForm.elements[0].value = calories;
  editForm.elements[1].value = note;
  editForm.addEventListener('submit', e => {
    e.preventDefault();
    fetch(`http://localhost:3000/api/v1/calorie_entries/${entryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        api_v1_calorie_entry: {
          calorie: e.target[0].value,
          note: e.target[1].value,
        },
      }),
    })
      .then(res => res.json())
      .then(entry => {
        document
          .querySelector(`#entry-${entry.id}`)
          .replaceWith(creatCalorieEntry(entry));
        document.querySelector('button.uk-modal-close-default').click();
        setProgressValue();
      });
  });
}

function deleteEntry(e) {
  const entryId = e.currentTarget.dataset.entryId;
  fetch(`http://localhost:3000/api/v1/calorie_entries/${entryId}`, {
    method: 'DELETE',
  })
    .then(res => res.json())
    .then(data => {
      document.querySelector(`#entry-${data.id}`).remove();
      setProgressValue();
    });
}

function calculateBmr(weight, height, age) {
  const lowerBmr = 655 + 4.35 * weight + 4.7 * height - 4.7 * age;
  const upperBmr = 66 + 6.23 * weight + 12.7 * height - 6.8 * age;
  return { lowerBmr, upperBmr };
}

function renderBmr(e) {
  e.preventDefault();
  const weight = parseInt(e.target[0].value, 10);
  const height = parseInt(e.target[1].value, 10);
  const age = parseInt(e.target[2].value, 10);
  const { lowerBmr, upperBmr } = calculateBmr(weight, height, age);
  document.querySelector('#lower-bmr-range').innerText = Math.floor(lowerBmr);
  document.querySelector('#higher-bmr-range').innerText = Math.floor(upperBmr);
  document.querySelector('progress').max = (lowerBmr + upperBmr) / 2;
}

function setProgressValue() {
  const calories = [];
  document
    .querySelector('#calories-list')
    .querySelectorAll('strong')
    .forEach(cal => {
      calories.push(parseInt(cal.innerText), 10);
    });
  const totalCaloriesConsumed = calories.reduce((a, b) => a + b, 0);
  document.querySelector('progress').value = totalCaloriesConsumed;
}

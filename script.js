const API_URL = '/api'; // Поскольку фронт и бек на одном сервере
const translations = {
  rus: {
    main: 'Главная',
    createAd: 'Создать объявление',
    admin: 'Админ панель',
    search: 'Поиск...',
    minPrice: 'Мин цена (грн)',
    maxPrice: 'Макс цена (грн)',
    allCities: 'Все города',
    apply: 'Применить',
    createTitle: 'Создать объявление',
    title: 'Название',
    price: 'Цена (грн)',
    description: 'Описание',
    city: 'Город',
    username: 'Telegram username (без @)',
    submit: 'Отправить на модерацию',
    cancel: 'Отмена',
    writeSeller: 'Написать продавцу',
    adminTitle: 'Админ панель',
    password: 'Пароль',
    login: 'Войти',
    approve: 'Одобрить',
    reject: 'Отклонить'
  },
  ukr: {
    main: 'Головна',
    createAd: 'Створити оголошення',
    admin: 'Адмін панель',
    search: 'Пошук...',
    minPrice: 'Мін ціна (грн)',
    maxPrice: 'Макс ціна (грн)',
    allCities: 'Всі міста',
    apply: 'Застосувати',
    createTitle: 'Створити оголошення',
    title: 'Назва',
    price: 'Ціна (грн)',
    description: 'Опис',
    city: 'Місто',
    username: 'Telegram username (без @)',
    submit: 'Відправити на модерацію',
    cancel: 'Скасувати',
    writeSeller: 'Написати продавцю',
    adminTitle: 'Адмін панель',
    password: 'Пароль',
    login: 'Увійти',
    approve: 'Схвалити',
    reject: 'Відхилити'
  }
};

let lang = localStorage.getItem('lang') || 'rus';
let theme = localStorage.getItem('theme') || 'dark';
let currentCategory = 'all';
let initData = Telegram.WebApp.initData;

document.body.classList.add(theme);
document.getElementById('lang-select').value = lang;
updateTranslations();

function updateTranslations() {
  // Обновить текст по lang
  document.querySelector('[data-category="all"]').textContent = translations[lang].main;
  document.getElementById('submit-ad-btn').textContent = translations[lang].createAd;
  document.getElementById('admin-btn').textContent = translations[lang].admin;
  document.getElementById('search').placeholder = translations[lang].search;
  document.getElementById('min-price').placeholder = translations[lang].minPrice;
  document.getElementById('max-price').placeholder = translations[lang].maxPrice;
  document.getElementById('city-select').options[0].text = translations[lang].allCities;
  document.getElementById('apply-filters').textContent = translations[lang].apply;
  // И т.д. для других элементов, добавьте по необходимости
}

function fetchAds() {
  const search = document.getElementById('search').value;
  const min_price = document.getElementById('min-price').value;
  const max_price = document.getElementById('max-price').value;
  const city = document.getElementById('city-select').value;
  const params = new URLSearchParams({ search, min_price, max_price, city });
  if (currentCategory !== 'all') params.append('category', currentCategory);

  fetch(`${API_URL}/ads?${params}`, {
    headers: { 'X-Telegram-InitData': initData }
  })
    .then(res => res.json())
    .then(ads => {
      const grid = document.getElementById('ads-grid');
      grid.innerHTML = '';
      ads.forEach(ad => {
        const card = document.createElement('div');
        card.classList.add('ad-card');
        card.innerHTML = `
          <img src="${ad.photos[0] || ''}" alt="${ad.title}">
          <h3>${ad.title}</h3>
          <div class="price">${ad.price} грн</div>
          <div class="city">${ad.city}</div>
        `;
        card.onclick = () => showAdDetail(ad);
        grid.appendChild(card);
      });
    });
}

function showAdDetail(ad) {
  const detail = document.getElementById('ad-detail');
  detail.innerHTML = `
    <h2>${ad.title}</h2>
    ${ad.photos.map(photo => `<img src="${photo}" alt="">`).join('')}
    <p>${ad.description}</p>
    <div class="price">${ad.price} грн</div>
    <div class="city">${ad.city}</div>
    <button id="write-seller">${translations[lang].writeSeller}</button>
    <button id="close-detail">Закрыть</button>
  `;
  detail.classList.remove('hidden');
  document.getElementById('write-seller').onclick = () => {
    Telegram.WebApp.openTelegramLink(`https://t.me/${ad.username}`);
  };
  document.getElementById('close-detail').onclick = () => detail.classList.add('hidden');
}

document.getElementById('apply-filters').onclick = fetchAds;

document.querySelectorAll('.categories li').forEach(li => {
  li.onclick = () => {
    currentCategory = li.dataset.category;
    fetchAds();
  };
});

document.getElementById('theme-toggle').onclick = () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light');
  localStorage.setItem('theme', theme);
};

document.getElementById('lang-select').onchange = e => {
  lang = e.target.value;
  localStorage.setItem('lang', lang);
  updateTranslations();
  fetchAds(); // Обновить, если нужно
};

document.getElementById('submit-ad-btn').onclick = () => {
  document.getElementById('submit-form').classList.remove('hidden');
};

document.getElementById('cancel-submit').onclick = () => {
  document.getElementById('submit-form').classList.add('hidden');
};

document.getElementById('submit-ad').onclick = () => {
  const formData = new FormData();
  formData.append('title', document.getElementById('title').value);
  formData.append('category', document.getElementById('category').value);
  formData.append('price', document.getElementById('price').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('city', document.getElementById('city').value);
  formData.append('username', document.getElementById('username').value);
  const photos = document.getElementById('photos').files;
  for (let i = 0; i < photos.length; i++) {
    formData.append('photos', photos[i]);
  }

  fetch(`${API_URL}/submit-ad`, {
    method: 'POST',
    headers: { 'X-Telegram-InitData': initData },
    body: formData
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('Объявление отправлено на модерацию');
        document.getElementById('submit-form').classList.add('hidden');
      }
    });
};

document.getElementById('admin-btn').onclick = () => {
  document.getElementById('admin-panel').classList.remove('hidden');
  document.getElementById('pending-ads').classList.add('hidden');
};

document.getElementById('admin-login').onclick = () => {
  const password = document.getElementById('admin-password').value;
  fetch(`${API_URL}/admin/pending`, {
    headers: { 'X-Admin-Password': password }
  })
    .then(res => res.json())
    .then(ads => {
      const pending = document.getElementById('pending-ads');
      pending.innerHTML = '';
      ads.forEach(ad => {
        const card = document.createElement('div');
        card.classList.add('ad-card');
        card.innerHTML = `
          <h3>${ad.title}</h3>
          <p>${ad.description}</p>
          <button onclick="adminAction('approve', ${ad.id}, '${password}')">${translations[lang].approve}</button>
          <button onclick="adminAction('reject', ${ad.id}, '${password}')">${translations[lang].reject}</button>
        `;
        pending.appendChild(card);
      });
      pending.classList.remove('hidden');
    })
    .catch(() => alert('Неверный пароль'));
};

window.adminAction = (action, id, password) => {
  fetch(`${API_URL}/admin/${action}/${id}`, {
    method: 'POST',
    headers: { 'X-Admin-Password': password }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert(`Объявление ${action === 'approve' ? 'одобрено' : 'отклонено'}`);
        document.getElementById('admin-login').click(); // Обновить список
      }
    });
};

// Инициализация
Telegram.WebApp.ready();
fetchAds();
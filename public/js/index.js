import '@babel/polyfill';
import { login, logout } from './login.js';
import { displayMap } from './mapbox.js';
import { updateSetting } from './updateSettings';

// DOM ELEMENT
const loginForm = document.querySelector('.form__login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const mapBox = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');

// const logIn = document.getElementById('logIn');
// const text = document.querySelector('.nav__el--cta');

// const user = document.querySelector('.user');

// VALUES
// console.log('logoutBtn');

//***display map
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

//***loging
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email, password);
    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(document.getElementById('photo').files[0]);

    console.log(form);

    updateSetting(form, 'data');
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password ').textContent = 'updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    console.log(passwordConfirm, password, passwordCurrent);

    await updateSetting(
      { passwordConfirm, password, passwordCurrent },
      'password'
    );

    document.querySelector('.btn--save-password ').textContent =
      'save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

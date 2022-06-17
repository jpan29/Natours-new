import '@babel/polyfill'
import { login, logout } from './login'
import { updateSettings } from './updateSettings'
import { bookTour } from './stripe'
import { signup } from './signup'

const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const updateForm = document.querySelector('.form-user-data')
const passwordForm = document.querySelector('.form-user-password')
const bookBtn = document.querySelector('#book-tour')

const signupForm = document.querySelector('.form--signup')


if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault()
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    login(email, password)

  })
}
if (logoutBtn)
  logoutBtn.addEventListener('click', logout)

if (updateForm) {
  updateForm.addEventListener('submit', e => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', updateForm.querySelector('#name').value)
    formData.append('email', updateForm.querySelector('#email').value)
    formData.append('photo', updateForm.querySelector('#photo').files[0])
    console.log(updateForm.querySelector('#photo').files)
    console.log(formData)
    updateSettings(formData, 'data')

  })
}
if (passwordForm) {
  passwordForm.addEventListener('submit', async e => {
    e.preventDefault()
    const currentPassword = passwordForm.querySelector('#password-current').value
    const newPassword = passwordForm.querySelector('#password').value
    const confirmNewPassword = passwordForm.querySelector('#password-confirm').value
    await updateSettings({ currentPassword, newPassword, confirmNewPassword }, 'password')
    passwordForm.querySelector('#password-current').value = ''
    passwordForm.querySelector('#password').value = ''
    passwordForm.querySelector('#password-confirm').value = ''
  })
}

if (bookBtn) bookBtn.addEventListener('click', e => {

  e.target.textContent = 'Waiting...'
  const { tourId } = e.target.dataset

  bookTour(tourId)
})

if (signupForm) signupForm.addEventListener('submit', e => {
  e.preventDefault()
  const formData = new FormData()
  const name = signupForm.querySelector('#name').value
  const email = signupForm.querySelector('#email').value
  const password = signupForm.querySelector('#password').value
  const confirmPassword = signupForm.querySelector('#confirmPassword').value

  signup(name, email, password, confirmPassword)

})


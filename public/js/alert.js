export const showAlert = (type, msg) => {
  hideAlert()
  const html = `<div class='alert alert--${type}'>${msg}<div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', html)
  setTimeout(hideAlert, 5000)
}
export const hideAlert = () => {

  const el = document.querySelector('.alert')
  if (el) el.parentElement.removeChild(el)

}
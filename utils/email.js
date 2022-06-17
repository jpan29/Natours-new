const nodemailer = require('nodemailer')
const pug = require('pug')
const htmlToText = require('html-to-text')
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email,
      this.url = url,
      this.firstName = user.name.split(' ')[0],
      this.from = `Penny <${process.env.EMAIL_ADDRESS}>`
  }


  newTransport () {
    if (process.env.NODE_ENV === 'production') return 1

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }
  // send the email
  async send (template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      subject,
      url: this.url
    })

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    }

    await this.newTransport().sendMail(mailOptions)

  }

  async sendWelcome () {
    await this.send('welcome', 'Welcome to join Natours family!')

  }
  async sendPasswordReset () {
    await this.send('passwordReset', 'Your password reset token(valid for 10 minutes')

  }
}



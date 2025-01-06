import nodemailer from 'nodemailer';
import {
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE
} from './emailTemplates.js'

const transporter = nodemailer.createTransport({
  host: 'mail.rivo-tech.io',
  port: 465,
  secure: true, 
  auth: {
    user: 'no-reply@rivo-tech.io',
    pass: '@gG0D*7e]4?K',
  },
})

export const sendVerificationEmail = async (email, firstName, verificationToken) => {
  const mailOptions = {
    from: 'no-reply@rivo-tech.io',
    to: email,
    subject: 'Welcome to Rivo! Please verify your email address',
    html: VERIFICATION_EMAIL_TEMPLATE
    .replace('{firstName}', firstName) 
    .replace('{verificationToken}', verificationToken),
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error sending verify email:', err.message)
    } else {
      console.log('Verify email sent:', info.response)
    }
  })
}

export const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: 'no-reply@rivo-tech.io',
    to: email,
    subject: 'Welcome to Rivo!',
    html: WELCOME_EMAIL_TEMPLATE.replace('{firstName}', firstName)
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error sending welcome email:', err.message)
    } else {
      console.log('Welcome email sent:', info.response)
    }
  })
}

export const sendPasswordResetEmail = async (email, resetURL) => {
  const mailOptions = {
    from: 'no-reply@rivo-tech.io',
    to: email,
    subject: 'Reset your password',
    html: PASSWORD_RESET_REQUEST_TEMPLATE
      .replace('{resetURL}', resetURL)
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error sending reset password email:', err.message)
    } else {
      console.log('Reset password email sent:', info.response)
    }
  })
}

export const sendResetSuccessEmail = async (email) => {
  const mailOptions = {
    from: 'no-reply@rivo-tech.io',
    to: email,
    subject: 'Password reset successfully',
    html: PASSWORD_RESET_SUCCESS_TEMPLATE
  }

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log('Error sending reset password success email:', err.message)
    } else {
      console.log('Reset password success email sent:', info.response)
    }
  })
}
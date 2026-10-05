import express from 'express'
import { productsRouter } from './routes/products.js'
import { authRouter } from './routes/auth.js'
import { meRouter } from './routes/me.js'
import { cartRouter } from './routes/cart.js' 
import session from 'express-session'

const app = express() 
const PORT = 8000
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && !process.env.SPIRAL_SESSION_SECRET) {
  throw new Error('SPIRAL_SESSION_SECRET must be set in production')
}
const secret = process.env.SPIRAL_SESSION_SECRET || 'jellyfish-baskingshark'

// Behind nginx: lets express-session see HTTPS via X-Forwarded-Proto
app.set('trust proxy', 1)

app.use(express.json())

app.use(session({
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax'
  }
}))

app.use(express.static('public'))

app.use('/api/products', productsRouter)

app.use('/api/auth/me', meRouter)

app.use('/api/auth', authRouter)

app.use('/api/cart', cartRouter)
 
app.listen(PORT, () => { 
  console.log(`Server running at http://localhost:${PORT}`)
}).on('error', (err) => {
  console.error('Failed to start server:', err)
}) 
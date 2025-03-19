import e from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { morganMiddleware } from './utils/logger'
import globalErrCatch from './utils/globalError'
 


const app = e()

// allow cors 
 app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','PUT','DELETE','POST'],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
 }))

// parsing incoming requests with JSON payload
app.use(e.json({
  limit: '8kb',
  strict: true
}))

//  application/x-www-form-urlencoded format.
app.use(e.urlencoded({
  extended: true,
  limit: '8kb',
}))

// app.use(e.static('public'))

app.use(cookieParser())

app.use(morganMiddleware)

//routes
// import demoRouter from './routes/demonroute'
// app.use('/api/v1/demoRoute',demoRouter)




app.use(globalErrCatch)

export default app
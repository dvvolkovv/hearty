import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Storage configuration для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './public/images'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

export const upload = multer({ storage })

import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { upload } from '../middleware/upload'
import prisma from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// Apply authentication to all routes
router.use(authenticate)

// ========================================
// Upload Avatar (User)
// ========================================
router.post('/avatar', upload.single('avatar'), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    if (!req.file) {
      throw new AppError('No file uploaded', 400)
    }

    // Validate file type (images only)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path)
      throw new AppError('Invalid file type. Only images are allowed', 400)
    }

    // Get current user to delete old avatar if exists
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true }
    })

    // Delete old avatar if exists
    if (currentUser?.avatar) {
      const oldFilePath = path.join('./public', currentUser.avatar)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    }

    // Update user with new avatar path
    const avatarUrl = `/images/${req.file.filename}`
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl }
    })

    res.json({
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: user.avatar
      }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Upload Specialist Image
// ========================================
router.post('/specialist/image', upload.single('image'), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    // Verify user is a specialist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user || user.role !== 'SPECIALIST' || !user.specialist) {
      throw new AppError('Only specialists can upload specialist images', 403)
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400)
    }

    // Validate file type (images only)
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path)
      throw new AppError('Invalid file type. Only images are allowed', 400)
    }

    // Delete old image if exists
    if (user.specialist.image) {
      const oldFilePath = path.join('./public', user.specialist.image)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    }

    // Update specialist with new image path
    const imageUrl = `/images/${req.file.filename}`
    const specialist = await prisma.specialist.update({
      where: { id: user.specialist.id },
      data: { image: imageUrl }
    })

    res.json({
      message: 'Specialist image uploaded successfully',
      data: {
        imageUrl: specialist.image
      }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Upload Specialist Certificates (multiple files)
// ========================================
router.post('/specialist/certificates', upload.array('certificates', 10), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    // Verify user is a specialist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user || user.role !== 'SPECIALIST' || !user.specialist) {
      throw new AppError('Only specialists can upload certificates', 403)
    }

    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      throw new AppError('No files uploaded', 400)
    }

    // Validate file types (images and PDFs)
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    ]

    const invalidFiles: Express.Multer.File[] = []
    const validFiles: Express.Multer.File[] = []

    files.forEach(file => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        invalidFiles.push(file)
        fs.unlinkSync(file.path)
      } else {
        validFiles.push(file)
      }
    })

    if (invalidFiles.length > 0) {
      throw new AppError(
        `Invalid file types: ${invalidFiles.map(f => f.originalname).join(', ')}. Only images and PDFs are allowed`,
        400
      )
    }

    // Generate URLs for uploaded files
    const certificateUrls = validFiles.map(file => `/images/${file.filename}`)

    // Append to existing certificates
    const updatedCertificates = [...user.specialist.certifications, ...certificateUrls]

    const specialist = await prisma.specialist.update({
      where: { id: user.specialist.id },
      data: { certifications: updatedCertificates }
    })

    res.json({
      message: 'Certificates uploaded successfully',
      data: {
        uploadedCount: validFiles.length,
        certificateUrls: certificateUrls,
        allCertificates: specialist.certifications
      }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Upload Chat Attachment
// ========================================
router.post('/chat/attachment', upload.single('attachment'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded', 400)
    }

    // Validate file type and size
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path)
      throw new AppError('Invalid file type. Only images and documents are allowed', 400)
    }

    // Max file size: 10MB
    if (req.file.size > 10 * 1024 * 1024) {
      fs.unlinkSync(req.file.path)
      throw new AppError('File size exceeds 10MB limit', 400)
    }

    const attachmentUrl = `/images/${req.file.filename}`

    res.json({
      message: 'Attachment uploaded successfully',
      data: {
        attachmentUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    })
  } catch (error) {
    next(error)
  }
})

// ========================================
// Delete File
// ========================================
router.delete('/:filename', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const filename = req.params.filename as string

    if (!filename) {
      throw new AppError('Filename is required', 400)
    }

    // Security: prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new AppError('Invalid filename', 400)
    }

    const filePath = path.join('./public/images', filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found', 404)
    }

    // Verify user owns this file by checking if it's referenced in their data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const fileUrl = `/images/${filename}`
    let canDelete = false

    // Check if file belongs to user
    if (user.avatar === fileUrl) {
      canDelete = true
      // Update user avatar to null
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: null }
      })
    }

    // Check if file belongs to specialist
    if (user.specialist) {
      if (user.specialist.image === fileUrl) {
        canDelete = true
        await prisma.specialist.update({
          where: { id: user.specialist.id },
          data: { image: null }
        })
      }

      if (user.specialist.certifications.includes(fileUrl)) {
        canDelete = true
        const updatedCertificates = user.specialist.certifications.filter(cert => cert !== fileUrl)
        await prisma.specialist.update({
          where: { id: user.specialist.id },
          data: { certifications: updatedCertificates }
        })
      }
    }

    if (!canDelete) {
      throw new AppError('You do not have permission to delete this file', 403)
    }

    // Delete the file
    fs.unlinkSync(filePath)

    res.json({
      message: 'File deleted successfully',
      data: { filename }
    })
  } catch (error) {
    next(error)
  }
})

export default router

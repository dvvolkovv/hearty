import { Router } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import prisma from '../config/database'
import { authenticate, AuthRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

router.use(authenticate)

// POST /api/clients - Create a client (specialist only)
// Creates a guest User + Client for tracking in specialist's dashboard
router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const { name, phone, email } = req.body

    if (!name || !name.trim()) {
      throw new AppError('Client name is required', 400)
    }

    // Verify user is a specialist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can create clients', 403)
    }

    // Check if client with this email already exists
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { client: true }
      })

      if (existingUser?.client) {
        return res.json({
          message: 'Client already exists',
          client: {
            id: existingUser.client.id,
            name: existingUser.client.name || existingUser.firstName || name,
            phone: existingUser.phone || phone,
            email: existingUser.email
          }
        })
      }
    }

    // Create a guest user and client
    const guestEmail = email || `guest-${crypto.randomUUID().slice(0, 8)}@hearty.pro`
    const guestPassword = crypto.randomBytes(32).toString('hex')
    const passwordHash = await bcrypt.hash(guestPassword, 10)

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: guestEmail,
          passwordHash,
          role: 'CLIENT',
          firstName: name.trim().split(' ')[0],
          lastName: name.trim().split(' ').slice(1).join(' ') || undefined,
          phone: phone || null,
          status: 'ACTIVE',
          emailVerified: true
        }
      })

      const newClient = await tx.client.create({
        data: {
          userId: newUser.id,
          name: name.trim()
        }
      })

      return { user: newUser, client: newClient }
    })

    // Create an initial booking link between specialist and client
    // so the client appears in specialist's client list
    await prisma.booking.create({
      data: {
        clientId: result.client.id,
        specialistId: user.specialist.id,
        date: new Date(),
        time: '00:00',
        price: 0,
        status: 'CANCELLED',
        isPaid: false
      }
    })

    res.status(201).json({
      message: 'Client created successfully',
      client: {
        id: result.client.id,
        name: result.client.name,
        phone: result.user.phone || '',
        email: result.user.email
      }
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/clients - List clients for the specialist
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can view clients', 403)
    }

    const bookings = await prisma.booking.findMany({
      where: { specialistId: user.specialist.id },
      include: {
        client: {
          include: {
            user: {
              select: { email: true, phone: true }
            }
          }
        }
      },
      distinct: ['clientId']
    })

    const clients = bookings.map(b => ({
      id: b.client.id,
      name: b.client.name || b.client.user?.email || 'Клиент',
      phone: b.client.user?.phone || '',
      email: b.client.user?.email || ''
    }))

    res.json({ clients })
  } catch (error) {
    next(error)
  }
})

// PUT /api/clients/:id - Update a client
router.put('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const clientId = req.params.id as string
    const { name, phone, email } = req.body

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can update clients', 403)
    }

    const hasBooking = await prisma.booking.findFirst({
      where: {
        specialistId: user.specialist.id,
        clientId
      }
    })

    if (!hasBooking) {
      throw new AppError('Client not found or access denied', 404)
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      throw new AppError('Client not found', 404)
    }

    await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.client.update({
          where: { id: clientId },
          data: { name: name.trim() }
        })
      }

      if (phone !== undefined || email !== undefined) {
        const updateData: any = {}
        if (phone !== undefined) updateData.phone = phone
        if (email !== undefined) updateData.email = email
        await tx.user.update({
          where: { id: client.userId },
          data: updateData
        })
      }
    })

    const updatedClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: { user: { select: { email: true, phone: true } } }
    })

    res.json({
      message: 'Client updated successfully',
      client: {
        id: updatedClient!.id,
        name: updatedClient!.name,
        phone: updatedClient!.user?.phone || '',
        email: updatedClient!.user?.email || ''
      }
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/clients/:id/notes - Add a note to a client
router.post('/:id/notes', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const clientId = req.params.id as string
    const { text } = req.body

    if (!text || !text.trim()) {
      throw new AppError('Note text is required', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can add notes', 403)
    }

    const note = await prisma.clientNote.create({
      data: {
        specialistId: user.specialist.id,
        clientId,
        text: text.trim()
      }
    })

    res.status(201).json({
      message: 'Note added successfully',
      note
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/clients/:id/notes - Get notes for a client
router.get('/:id/notes', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const clientId = req.params.id as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can view notes', 403)
    }

    const notes = await prisma.clientNote.findMany({
      where: {
        specialistId: user.specialist.id,
        clientId
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({ notes })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/clients/notes/:noteId - Delete a note
router.delete('/notes/:noteId', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id
    const noteId = req.params.noteId as string

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { specialist: true }
    })

    if (!user?.specialist) {
      throw new AppError('Only specialists can delete notes', 403)
    }

    const note = await prisma.clientNote.findUnique({
      where: { id: noteId }
    })

    if (!note || note.specialistId !== user.specialist.id) {
      throw new AppError('Note not found or access denied', 404)
    }

    await prisma.clientNote.delete({
      where: { id: noteId }
    })

    res.json({ message: 'Note deleted successfully' })
  } catch (error) {
    next(error)
  }
})

export default router

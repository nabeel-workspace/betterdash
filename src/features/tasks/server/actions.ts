import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import prisma from '@/lib/prisma'

import { createTaskSchema } from '../data/schema'

export const createTaskFn = createServerFn({ method: 'POST' })
  .inputValidator(createTaskSchema)
  .handler(async ({ data }) => {
    const task = await prisma.task.create({
      data,
    })
    return task
  })

export const updateTaskFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      id: z.string(),
      data: createTaskSchema,
    }),
  )
  .handler(async ({ data }) => {
    const task = await prisma.task.update({
      where: { id: data.id },
      data: data.data,
    })
    return task
  })

export const deleteTaskFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await prisma.task.delete({
      where: { id: data.id },
    })
    return { success: true }
  })

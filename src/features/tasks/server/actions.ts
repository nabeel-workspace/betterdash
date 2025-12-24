import { faker } from '@faker-js/faker'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import prisma from '@/lib/prisma'

import { createTaskSchema } from '../data/schema'

export const createTaskFn = createServerFn({ method: 'POST' })
  .inputValidator(createTaskSchema)
  .handler(async ({ data }) => {
    const count = await prisma.task.count()
    const task = await prisma.task.create({
      data: {
        ...data,
        code: `TASK-${(count + 1).toString().padStart(4, '0')}`,
      },
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

export const getTasksFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      pageIndex: z.number().default(0),
      pageSize: z.number().default(10),
      sorting: z
        .array(z.object({ id: z.string(), desc: z.boolean() }))
        .optional(),
      status: z.array(z.string()).optional(),
      priority: z.array(z.string()).optional(),
      title: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { pageIndex, pageSize, sorting, status, priority, title } = data
    const skip = pageIndex * pageSize
    const take = pageSize

    const where: any = {
      AND: [],
    }

    if (title) {
      where.AND.push({ title: { contains: title, mode: 'insensitive' } })
    }
    if (status?.length) {
      where.AND.push({ status: { in: status } })
    }
    if (priority?.length) {
      where.AND.push({ priority: { in: priority } })
    }

    // Clean up empty AND
    if (where.AND.length === 0) delete where.AND

    const orderBy = sorting?.length
      ? sorting.map((s) => ({ [s.id]: s.desc ? 'desc' : 'asc' }))
      : [{ createdAt: 'desc' }]

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: orderBy as any,
      }),
      prisma.task.count({ where }),
    ])

    return { data: tasks, pageCount: Math.ceil(total / pageSize), total }
  })

export const seedTasksFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const LABELS = ['bug', 'feature', 'documentation']
    const STATUSES = ['backlog', 'todo', 'in progress', 'done', 'canceled']
    const PRIORITIES = ['low', 'medium', 'high', 'critical']

    const tasks = Array.from({ length: 100 }).map((_, i) => ({
      code: `TASK-${(i + 1).toString().padStart(4, '0')}`,
      title: faker.lorem.sentence({ min: 5, max: 15 }),
      status: faker.helpers.arrayElement(STATUSES),
      label: faker.helpers.arrayElement(LABELS),
      priority: faker.helpers.arrayElement(PRIORITIES),
    }))

    await prisma.task.createMany({
      data: tasks,
    })

    return { success: true, count: 100 }
  },
)

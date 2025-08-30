import { t } from 'elysia'

export const todoSchema = {
    // Base todo schema that represents the database model
    todo: t.Object({
        id: t.Number({
            description: 'Unique identifier for the todo'
        }),
        title: t.String({
            description: 'Title of the todo item',
            minLength: 1,
            maxLength: 100
        }),
        description: t.Optional(t.String({
            description: 'Detailed description of the todo item',
            maxLength: 500
        })),
        completed: t.Boolean({
            description: 'Indicates whether the todo is completed',
            default: false
        }),
        createdAt: t.String({
            description: 'Timestamp when the todo was created',
            format: 'date-time'
        }),
        updatedAt: t.String({
            description: 'Timestamp when the todo was last updated',
            format: 'date-time'
        })
    }, {
        description: 'Represents a todo item in the system'
    }),

    // Schema for creating a new todo
    createTodo: t.Object({
        title: t.String({
            description: 'Title of the new todo item',
            minLength: 1,
            maxLength: 100,
            examples: ['Learn Elysia', 'Build REST API']
        }),
        description: t.Optional(t.String({
            description: 'Optional detailed description of the todo item',
            maxLength: 500,
            examples: ['Study Elysia documentation and build a sample project']
        }))
    }, {
        description: 'Data required to create a new todo item'
    }),

    // Schema for updating an existing todo
    updateTodo: t.Partial(t.Object({
        title: t.String({
            description: 'New title for the todo item',
            minLength: 1,
            maxLength: 100,
            examples: ['Updated: Learn Elysia']
        }),
        description: t.String({
            description: 'New description for the todo item',
            maxLength: 500,
            examples: ['Updated description with more details']
        }),
        completed: t.Boolean({
            description: 'New completion status',
            examples: [true]
        })
    }), {
        description: 'Data that can be updated for a todo item'
    })
}
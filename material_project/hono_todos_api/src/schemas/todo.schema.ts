// src/schemas/todo.schema.ts
// OpenAPI schema definitions for Swagger documentation
export const todoSchemas = {
  Todo: {
      type: 'object',
      properties: {
          id: { type: 'integer', description: 'Unique identifier for the todo' },
          title: { type: 'string', description: 'Title of the todo item' },
          description: { type: 'string', description: 'Detailed description of the todo' },
          completed: { type: 'boolean', description: 'Completion status' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
      },
      required: ['id', 'title', 'completed']
  },
  CreateTodoBody: {
      type: 'object',
      properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 }
      },
      required: ['title']
  },
  UpdateTodoBody: {
      type: 'object',
      properties: {
          title: { type: 'string', minLength: 1, maxLength: 100 },
          description: { type: 'string', maxLength: 500 },
          completed: { type: 'boolean' }
      }
  }
};
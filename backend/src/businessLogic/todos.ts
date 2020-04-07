import * as uuid from 'uuid';

import { TodoAccess } from '../dataLayer/todoAccess';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';

const todoAccess = new TodoAccess();

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
  return todoAccess.getItems(userId);
};

export const updateTodo = async (
  userId: string,
  todoId: string,
  dto: TodoUpdate,
): Promise<TodoItem> => {
  return todoAccess.updateItem(userId, todoId, dto);
};

export const createTodo = async (
  userId: string,
  body: CreateTodoRequest,
): Promise<TodoItem> => {
  const dto = {
    ...body,
    userId,
    createdAt: new Date().toISOString(),
    todoId: uuid.v4(),
    done: false,
    attachmentUrl: '',
  }
  return todoAccess.createItem(dto);
};


export const deleteTodo = async (
  userId: string,
  todoId: string,
): Promise<void> => {
  const item = await todoAccess.getById(userId, todoId);
  if (item.attachmentUrl) {
    await todoAccess.deleteFile(userId, todoId);
  }
  await todoAccess.deleteItem(userId, todoId);
};

import { sqliteTable, text, integer, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const students = sqliteTable('students', {
  id: text('id').primaryKey(), name: text('name').notNull(), createdAt: integer('created_at').notNull(), createdBy: text('created_by').notNull()
});
export const assessments = sqliteTable('assessments', {
  studentId: text('student_id').notNull().references(() => students.id), itemId: integer('item_id').notNull(), level: text('level').notNull(), comment: text('comment').notNull().default(''), updatedAt: integer('updated_at').notNull(), updatedBy: text('updated_by').notNull()
}, t => [primaryKey({columns:[t.studentId,t.itemId]})]);
export const users = sqliteTable('users', {
  email: text('email').primaryKey(), name: text('name').notNull(), role: text('role').notNull(), createdAt: integer('created_at').notNull(), username: text('username'), passwordHash: text('password_hash'), passwordSalt: text('password_salt')
}, t => [uniqueIndex('users_username_unique').on(t.username)]);
export const sessions = sqliteTable('sessions', { tokenHash: text('token_hash').primaryKey(), userEmail: text('user_email').notNull().references(() => users.email), expiresAt: integer('expires_at').notNull() });
export const momentEdits = sqliteTable('moment_edits', { itemId: integer('item_id').primaryKey(), title: text('title').notNull(), description: text('description').notNull(), updatedAt: integer('updated_at').notNull(), updatedBy: text('updated_by').notNull() });
export const customMoments = sqliteTable('custom_moments', { id: integer('id').primaryKey({autoIncrement:true}), title: text('title').notNull(), description: text('description').notNull(), createdAt: integer('created_at').notNull(), createdBy: text('created_by').notNull() });
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(), studentId: text('student_id').notNull().references(() => students.id), itemId: integer('item_id').notNull(), body: text('body').notNull(), createdAt: integer('created_at').notNull(), authorEmail: text('author_email').notNull(), deletedAt: integer('deleted_at'), deletedBy: text('deleted_by')
});
export const loginAttempts = sqliteTable('login_attempts', { username: text('username').primaryKey(), count: integer('count').notNull(), until: integer('until').notNull() });

export type NoteWithRelations = {
  id: number;
  notionPageId: string;
  title: string;
  content: string;
  summary: string | null;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  notionUpdatedAt: Date | null;
  category: CategoryWithParent | null;
  noteTags: NoteTags[];
};

export type NoteTags = {
  id: number;
  noteId: number;
  tagId: number;
  tag: Tag;
};

export type Tag = {
  id: number;
  name: string;
};

export type CategoryWithParent = {
  id: number;
  name: string;
  parentId: number | null;
  parent: { id: number; name: string } | null;
};

export type CategoryWithChildren = {
  id: number;
  name: string;
  parentId: number | null;
  children: CategoryWithChildren[];
};

export type NoteListItem = {
  id: number;
  title: string;
  summary: string | null;
  categoryId: number | null;
  category: CategoryWithParent | null;
  noteTags: NoteTags[];
  updatedAt: Date;
};

export type SearchResult = {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  category: CategoryWithParent | null;
  noteTags: NoteTags[];
  updatedAt: Date;
};

export type SyncResult = {
  synced: number;
  errors: number;
  message: string;
};

export type NotionPage = {
  id: string;
  properties: Record<string, unknown>;
  last_edited_time: string;
};

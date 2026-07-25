export interface Blog {
  id: string;
  title: string;
  status: 'Published' | 'Inactive';
  date: string;
  image: string;
  slug: string;
}

export interface BlogsProps {
  onAddBlog: () => void;
  onEditBlog: (id: string) => void;
}

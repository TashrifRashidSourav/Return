export interface Post {
  _id: string;
  text: string;
  imageUrl: string | null;
  userId: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
  user: { name: string };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
}

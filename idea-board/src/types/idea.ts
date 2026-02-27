export interface Idea {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  result_url: string | null;
  votes_count: number;
  user_voted: number | null;
  author_username: string | null;
  author_name: string;
  author_id: number;
  created_at: string;
  updated_at: string;
  merged_into_id: number | null;
}

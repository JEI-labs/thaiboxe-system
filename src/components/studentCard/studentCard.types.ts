export interface StudentCardProps {
  id: string;
  name: string;
  avatar: string;
  email: string;
  status: string;
  planName: string;
  createdAt: Date;
  onDelete?: () => void;
  onEdit?: () => void;
}
